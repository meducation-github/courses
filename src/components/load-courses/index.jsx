import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  FileText,
  Hash,
  List,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../config/env";

// Helper function to get admin client when needed
const getSupabaseAdmin = async () => {
  const { getSupabaseAdmin: getAdmin } = await import("../../config/env");
  return getAdmin();
};

const LoadCourses = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    step: "",
    details: "",
    completed: false,
    error: null,
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadedCourseIds, setLoadedCourseIds] = useState([]);

  // Hardcoded institute ID as requested
  const INSTITUTE_ID = "550e8400-e29b-41d4-a716-446655440000";

  useEffect(() => {
    loadAvailableCourses();
  }, []);

  const loadAvailableCourses = async () => {
    try {
      setLoadingCourses(true);

      // Fetch courses from admin database
      const supabaseAdmin = await getSupabaseAdmin();
      const { data: adminCourses, error: adminError } = await supabaseAdmin
        .from("subjects_courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (adminError) {
        throw adminError;
      }

      // Fetch courses from institute database to check which ones are already loaded
      const { data: instituteCourses, error: instituteError } = await supabase
        .from("subjects_courses")
        .select("name, description, grade_id, board")
        .eq("institute_id", INSTITUTE_ID);

      if (instituteError) {
        throw instituteError;
      }

      // Identify which admin courses are already loaded in the institute
      const loadedIds = [];
      if (adminCourses && instituteCourses) {
        adminCourses.forEach((adminCourse) => {
          const isLoaded = instituteCourses.some(
            (instituteCourse) =>
              instituteCourse.name === adminCourse.name &&
              instituteCourse.description === adminCourse.description &&
              instituteCourse.grade_id === adminCourse.grade_id &&
              instituteCourse.board === adminCourse.board
          );
          if (isLoaded) {
            loadedIds.push(adminCourse.id);
          }
        });
      }

      setLoadedCourseIds(loadedIds);
      setAvailableCourses(adminCourses || []);
    } catch (error) {
      console.error("Error loading available courses:", error);
      toast.error("Failed to load available courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseSelection = (courseId) => {
    // Prevent selection of already loaded courses
    if (loadedCourseIds.includes(courseId)) {
      return;
    }

    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSelectAll = () => {
    // Get only the courses that haven't been loaded yet
    const loadableCourses = availableCourses.filter(
      (course) => !loadedCourseIds.includes(course.id)
    );

    if (selectedCourses.length === loadableCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(loadableCourses.map((course) => course.id));
    }
  };

  const loadCoursesToInstitute = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to load");
      return;
    }

    setLoading(true);
    setProgress({
      current: 0,
      total: selectedCourses.length,
      step: "Starting course transfer...",
      details: "",
      completed: false,
      error: null,
    });

    try {
      for (let i = 0; i < selectedCourses.length; i++) {
        const courseId = selectedCourses[i];
        const course = availableCourses.find((c) => c.id === courseId);

        if (!course) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        // Update progress
        setProgress((prev) => ({
          ...prev,
          current: i + 1,
          step: `Loading course: ${course.name}`,
          details: "Creating course in institute database...",
        }));

        // 1. Create course in institute database
        const { data: newCourse, error: courseError } = await supabase
          .from("subjects_courses")
          .insert([
            {
              name: course.name,
              code: course.code,
              description: course.description,
              grade_id: course.grade_id,
              board: course.board,
              institute_id: INSTITUTE_ID,
            },
          ])
          .select()
          .single();

        if (courseError) {
          throw new Error(`Failed to create course: ${courseError.message}`);
        }

        setProgress((prev) => ({
          ...prev,
          details: "Loading units...",
        }));

        // 2. Load units for this course
        const supabaseAdmin = await getSupabaseAdmin();
        const { data: units, error: unitsError } = await supabaseAdmin
          .from("units")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true });

        if (unitsError) {
          throw new Error(`Failed to load units: ${unitsError.message}`);
        }

        if (units && units.length > 0) {
          setProgress((prev) => ({
            ...prev,
            details: `Creating ${units.length} units...`,
          }));

          // Create units in institute database
          const unitsToInsert = units.map((unit) => ({
            course_id: newCourse.id,
            title: unit.title,
            short_description: unit.short_description,
            main_description: unit.main_description,
            order_index: unit.order_index,
            institute_id: INSTITUTE_ID,
          }));

          const { data: newUnits, error: newUnitsError } = await supabase
            .from("units")
            .insert(unitsToInsert)
            .select();

          if (newUnitsError) {
            throw new Error(`Failed to create units: ${newUnitsError.message}`);
          }

          // 3. Load topics for all units
          const unitIds = units.map((u) => u.id);
          const supabaseAdmin = await getSupabaseAdmin();
          const { data: topics, error: topicsError } = await supabaseAdmin
            .from("topics")
            .select("*")
            .in("unit_id", unitIds)
            .order("order_index", { ascending: true });

          if (topicsError) {
            throw new Error(`Failed to load topics: ${topicsError.message}`);
          }

          if (topics && topics.length > 0) {
            setProgress((prev) => ({
              ...prev,
              details: `Creating ${topics.length} topics...`,
            }));

            // Create topics in institute database
            const topicsToInsert = topics.map((topic) => {
              const originalUnit = units.find((u) => u.id === topic.unit_id);
              const newUnit = newUnits.find(
                (u) =>
                  u.title === originalUnit.title && u.course_id === newCourse.id
              );

              if (!newUnit) {
                throw new Error(
                  `Could not find matching unit for topic: ${topic.title}`
                );
              }

              return {
                unit_id: newUnit.id,
                title: topic.title,
                short_description: topic.short_description,
                main_description: topic.main_description,
                order_index: topic.order_index,
                institute_id: INSTITUTE_ID,
              };
            });

            const { data: newTopics, error: newTopicsError } = await supabase
              .from("topics")
              .insert(topicsToInsert)
              .select();

            if (newTopicsError) {
              throw new Error(
                `Failed to create topics: ${newTopicsError.message}`
              );
            }

            // 4. Load subtopics for all topics
            const topicIds = topics.map((t) => t.id);
            const supabaseAdmin = await getSupabaseAdmin();
            const { data: subtopics, error: subtopicsError } =
              await supabaseAdmin
                .from("subtopics")
                .select("*")
                .in("topic_id", topicIds)
                .order("order_index", { ascending: true });

            if (subtopicsError) {
              throw new Error(
                `Failed to load subtopics: ${subtopicsError.message}`
              );
            }

            if (subtopics && subtopics.length > 0) {
              setProgress((prev) => ({
                ...prev,
                details: `Creating ${subtopics.length} subtopics...`,
              }));

              // Create subtopics in institute database
              const subtopicsToInsert = subtopics.map((subtopic) => {
                const originalTopic = topics.find(
                  (t) => t.id === subtopic.topic_id
                );
                const newTopic = newTopics.find(
                  (t) => t.title === originalTopic.title
                );

                if (!newTopic) {
                  throw new Error(
                    `Could not find matching topic for subtopic: ${subtopic.title}`
                  );
                }

                return {
                  topic_id: newTopic.id,
                  parent_id: null, // We'll handle parent_id mapping in the next step
                  title: subtopic.title,
                  short_description: subtopic.short_description,
                  main_description: subtopic.main_description,
                  type: subtopic.type,
                  order_index: subtopic.order_index,
                  institute_id: INSTITUTE_ID,
                };
              });

              const { data: newSubtopics, error: newSubtopicsError } =
                await supabase
                  .from("subtopics")
                  .insert(subtopicsToInsert)
                  .select();

              if (newSubtopicsError) {
                throw new Error(
                  `Failed to create subtopics: ${newSubtopicsError.message}`
                );
              }

              // 5. Handle parent_id mapping for nested subtopics
              const subtopicsWithParent = subtopics.filter(
                (s) => s.parent_id !== null
              );
              if (subtopicsWithParent.length > 0) {
                setProgress((prev) => ({
                  ...prev,
                  details: "Mapping nested subtopics...",
                }));

                for (const subtopic of subtopicsWithParent) {
                  const originalParent = subtopics.find(
                    (s) => s.id === subtopic.parent_id
                  );
                  const newParent = newSubtopics.find(
                    (s) => s.title === originalParent.title
                  );
                  const newSubtopic = newSubtopics.find(
                    (s) => s.title === subtopic.title
                  );

                  if (newParent && newSubtopic) {
                    await supabase
                      .from("subtopics")
                      .update({ parent_id: newParent.id })
                      .eq("id", newSubtopic.id);
                  }
                }
              }
            }
          }
        }

        setProgress((prev) => ({
          ...prev,
          details: `Course "${course.title}" loaded successfully!`,
        }));

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setProgress((prev) => ({
        ...prev,
        step: "All courses loaded successfully!",
        details: `${selectedCourses.length} course(s) transferred to institute database`,
        completed: true,
      }));

      toast.success(
        `Successfully loaded ${selectedCourses.length} course(s) to institute database`
      );

      // Reset selection
      setSelectedCourses([]);

      // Trigger success callback to refresh courses list
      if (onSuccess) {
        onSuccess();
      }

      // Refresh the loaded courses list
      await loadAvailableCourses();

      // Close modal after successful transfer
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setProgress((prev) => ({
        ...prev,
        error: error.message,
        step: "Error occurred during transfer",
      }));
      toast.error(`Failed to load courses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Download className="w-6 h-6 text-blue-600" />
          Load Courses from Admin Database
        </h2>
        <p className="text-gray-600 mt-2">
          Transfer courses from the admin Supabase to your institute database
          with all units, topics, and subtopics.
        </p>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Available Courses
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {
                availableCourses.filter(
                  (course) => !loadedCourseIds.includes(course.id)
                ).length
              }{" "}
              available to load • {loadedCourseIds.length} already loaded
            </p>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {selectedCourses.length ===
            availableCourses.filter(
              (course) => !loadedCourseIds.includes(course.id)
            ).length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {loadingCourses ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading available courses...</p>
          </div>
        ) : availableCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses available
            </h3>
            <p className="text-gray-500">
              No courses found in the admin database.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableCourses.map((course) => {
              const isLoaded = loadedCourseIds.includes(course.id);
              const isSelected = selectedCourses.includes(course.id);

              return (
                <div
                  key={course.id}
                  className={`flex items-center p-4 border rounded-lg transition-colors ${
                    isLoaded
                      ? "border-green-200 bg-green-50 cursor-not-allowed opacity-75"
                      : isSelected
                      ? "border-blue-500 bg-blue-50 cursor-pointer"
                      : "border-gray-200 hover:border-gray-300 cursor-pointer"
                  }`}
                  onClick={() => !isLoaded && handleCourseSelection(course.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      !isLoaded && handleCourseSelection(course.id)
                    }
                    disabled={isLoaded}
                    className={`w-4 h-4 border-gray-300 rounded focus:ring-blue-500 mr-3 ${
                      isLoaded
                        ? "text-green-600 bg-green-100 cursor-not-allowed"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {isLoaded ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <h3
                          className={`font-medium ${
                            isLoaded ? "text-green-900" : "text-gray-900"
                          }`}
                        >
                          {course.name}
                          {isLoaded && (
                            <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                              Already Loaded
                            </span>
                          )}
                        </h3>
                        <p
                          className={`text-sm ${
                            isLoaded ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-4 mt-2 text-sm ${
                        isLoaded ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      <span>Grade ID: {course.grade_id}</span>
                      {course.code && (
                        <>
                          <span>•</span>
                          <span>Code: {course.code}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{course.board}</span>
                      <span>•</span>
                      <span>
                        Created{" "}
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={loadCoursesToInstitute}
          disabled={loading || selectedCourses.length === 0}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading Courses...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Load {selectedCourses.length} Selected Course
              {selectedCourses.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>

      {/* Progress Section */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transfer Progress
          </h3>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{progress.step}</span>
              <span>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">{progress.details}</div>
          </div>

          {/* Progress Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <BookOpen className="w-4 h-4" />
              <span>
                Course: {progress.current} of {progress.total}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
              <FileText className="w-4 h-4" />
              <span>Units, Topics, and Subtopics being transferred...</span>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {progress.completed && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Transfer Completed Successfully!
              </h3>
              <p className="text-green-700 mt-1">{progress.details}</p>
            </div>
          </div>
        </div>
      )}

      {progress.error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-900">
                Transfer Failed
              </h3>
              <p className="text-red-700 mt-1">{progress.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          What will be transferred?
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>
              Course details (name, code, description, grade_id, board)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>All units with their descriptions and order</span>
          </div>
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span>All topics within each unit</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <span>All subtopics and nested subtopics</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> All transferred content will be associated
            with your institute ID ({INSTITUTE_ID}) and can be modified
            independently without affecting other institutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadCourses;
