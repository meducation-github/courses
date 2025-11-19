import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Hash,
  List,
  FileText,
  Menu,
  X,
  Plus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../config/env";
import MarkdownRenderer from "./MarkdownRenderer";

// Custom Progress Component
const Progress = ({ percentage, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      ></div>
    </div>
  );
};

const STUDENT_ID = "400564af-e85e-48ad-8c4c-4047565712ad"; // Hardcoded for now (should be UUID in real use)

// Pakistan school boards data
const pakistanBoards = [
  // Federal
  {
    value: "fbise",
    label: "Federal Board of Intermediate and Secondary Education (FBISE)",
  },

  // Punjab
  { value: "bise_lahore", label: "BISE Lahore" },
  { value: "bise_rawalpindi", label: "BISE Rawalpindi" },
  { value: "bise_faisalabad", label: "BISE Faisalabad" },
  { value: "bise_multan", label: "BISE Multan" },
  { value: "bise_gujranwala", label: "BISE Gujranwala" },
  { value: "bise_sargodha", label: "BISE Sargodha" },
  { value: "bise_bahawalpur", label: "BISE Bahawalpur" },

  // Sindh
  { value: "bise_karachi", label: "BISE Karachi" },
  { value: "bise_hyderabad", label: "BISE Hyderabad" },
  { value: "bise_sukkur", label: "BISE Sukkur" },
  { value: "bise_larkana", label: "BISE Larkana" },
  { value: "bise_mirpurkhas", label: "BISE Mirpurkhas" },

  // KPK
  { value: "bise_peshawar", label: "BISE Peshawar" },
  { value: "bise_mardan", label: "BISE Mardan" },
  { value: "bise_abbottabad", label: "BISE Abbottabad" },
  { value: "bise_bannu", label: "BISE Bannu" },
  { value: "bise_kohat", label: "BISE Kohat" },

  // Balochistan
  { value: "bise_quetta", label: "BISE Quetta" },
  { value: "bise_turbat", label: "BISE Turbat" },

  // AJK & GB
  { value: "bise_ajk", label: "BISE AJK" },
  { value: "bise_gilgit", label: "BISE Gilgit-Baltistan" },
];

const Courses = () => {
  const { courseId, unitId, topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);

  // Course structure state
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [courseClickLoading, setCourseClickLoading] = useState(false);

  // Sidenav state
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  // Error state
  const [urlError, setUrlError] = useState(null);

  // Progress state
  const [courseProgress, setCourseProgress] = useState(null);
  const [unitProgress, setUnitProgress] = useState({});
  const [topicProgress, setTopicProgress] = useState({});

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Debug: Log when courses are loaded
  useEffect(() => {
    console.log("Courses loaded:", courses.length, "courses");
  }, [courses]);

  // Handle direct URL access and sync with state
  useEffect(() => {
    const handleDirectUrlAccess = async () => {
      // If no courseId in URL, clear selections to show main courses list
      if (!courseId) {
        setSelectedCourse(null);
        setSelectedUnit(null);
        setSelectedTopic(null);
        setSelectedSubtopic(null);
        setUrlError(null);
        return;
      }

      // Wait for courses to be loaded
      if (courses.length === 0) {
        return;
      }

      // Don't handle URL access if we're currently clicking on a course
      if (courseClickLoading) {
        return;
      }

      // Find course by UUID (courseId is already a string from URL params)
      console.log(
        "URL courseId:",
        courseId,
        "Available courses:",
        courses.map((c) => ({ id: c.id, title: c.name }))
      );
      const course = courses.find((c) => c.id === courseId);

      if (course && (!selectedCourse || selectedCourse.id !== courseId)) {
        setUrlLoading(true);
        setUrlError(null);
        setSelectedCourse(course);
        // Reset other selections when course changes
        setSelectedUnit(null);
        setSelectedTopic(null);
        setSelectedSubtopic(null);

        // Load course structure
        await loadCourseStructure(course.id);
        setUrlLoading(false);
      } else if (!course) {
        setUrlError(`Course with ID ${courseId} not found`);
        setSelectedCourse(null);
      }
    };

    handleDirectUrlAccess();
  }, [courseId, courses, selectedCourse, courseClickLoading]);

  useEffect(() => {
    if (unitId && units.length > 0) {
      const unitIdNum = parseInt(unitId, 10);
      const unit = units.find((u) => u.id === unitIdNum);
      if (unit && (!selectedUnit || selectedUnit.id !== unitIdNum)) {
        setSelectedUnit(unit);
        // Reset topic and subtopic when unit changes
        setSelectedTopic(null);
        setSelectedSubtopic(null);
      }
    }
  }, [unitId, units, selectedUnit]);

  // Handle deep URL access (unit, topic, subtopic)
  useEffect(() => {
    const handleDeepUrlAccess = async () => {
      if (selectedCourse && units.length > 0) {
        // Handle unit selection
        if (unitId && !selectedUnit) {
          const unitIdNum = parseInt(unitId, 10);
          const unit = units.find((u) => u.id === unitIdNum);
          if (unit) {
            setSelectedUnit(unit);
          }
        }

        // Handle topic selection
        if (topicId && selectedUnit && topics.length > 0 && !selectedTopic) {
          const topicIdNum = parseInt(topicId, 10);
          const topic = topics.find((t) => t.id === topicIdNum);
          if (topic) {
            setSelectedTopic(topic);
          }
        }

        // Handle subtopic selection
        if (
          subtopicId &&
          selectedTopic &&
          subtopics.length > 0 &&
          !selectedSubtopic
        ) {
          const subtopicIdNum = parseInt(subtopicId, 10);
          const subtopic = subtopics.find((s) => s.id === subtopicIdNum);
          if (subtopic) {
            setSelectedSubtopic(subtopic);
          }
        }
      }
    };

    handleDeepUrlAccess();
  }, [
    selectedCourse,
    units,
    topics,
    subtopics,
    unitId,
    topicId,
    subtopicId,
    selectedUnit,
    selectedTopic,
    selectedSubtopic,
  ]);

  useEffect(() => {
    if (topicId && topics.length > 0) {
      const topicIdNum = parseInt(topicId, 10);
      const topic = topics.find((t) => t.id === topicIdNum);
      if (topic && (!selectedTopic || selectedTopic.id !== topicIdNum)) {
        setSelectedTopic(topic);
        // Reset subtopic when topic changes
        setSelectedSubtopic(null);
      }
    }
  }, [topicId, topics, selectedTopic]);

  useEffect(() => {
    if (subtopicId && subtopics.length > 0) {
      const subtopicIdNum = parseInt(subtopicId, 10);
      const subtopic = subtopics.find((s) => s.id === subtopicIdNum);
      if (
        subtopic &&
        (!selectedSubtopic || selectedSubtopic.id !== subtopicIdNum)
      ) {
        setSelectedSubtopic(subtopic);
      }
    }
  }, [subtopicId, subtopics, selectedSubtopic]);

  // Load course structure when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadCourseStructure(selectedCourse.id);
    }
  }, [selectedCourse]);

  // Auto-select first unit when course is selected (only if no unit is specified in URL)
  useEffect(() => {
    if (
      selectedCourse &&
      units.length > 0 &&
      !selectedUnit &&
      !unitId &&
      !courseClickLoading
    ) {
      const firstUnit = units[0];
      setSelectedUnit(firstUnit);
      // Navigate to the first unit immediately
      navigate(`/courses/${selectedCourse.id}/units/${firstUnit.id}`);
    }
  }, [
    selectedCourse,
    units,
    selectedUnit,
    unitId,
    navigate,
    courseClickLoading,
  ]);

  // Fetch course progress when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseProgress(selectedCourse.id);
    }
  }, [selectedCourse]);

  // Fetch unit progress when unit is selected
  useEffect(() => {
    if (selectedUnit && selectedCourse) {
      fetchUnitProgress(selectedUnit.id);
    }
  }, [selectedUnit, selectedCourse]);

  // Fetch topic progress when topic is selected
  useEffect(() => {
    if (selectedTopic && selectedCourse) {
      fetchTopicProgress(selectedTopic.id);
    }
  }, [selectedTopic, selectedCourse]);

  // Mark as in progress when viewing
  useEffect(() => {
    if (!selectedCourse) return;

    if (selectedUnit && !selectedTopic && !selectedSubtopic) {
      markInProgress({
        course_id: selectedCourse.id,
        unit_id: selectedUnit.id,
      });
    } else if (selectedTopic && !selectedSubtopic) {
      markInProgress({
        course_id: selectedCourse.id,
        unit_id: selectedUnit.id,
        topic_id: selectedTopic.id,
      });
    } else if (selectedSubtopic) {
      markInProgress({
        course_id: selectedCourse.id,
        unit_id: selectedUnit.id,
        topic_id: selectedTopic.id,
        subtopic_id: selectedSubtopic.id,
      });
    }
  }, [selectedCourse, selectedUnit, selectedTopic, selectedSubtopic]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects_courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadCourseStructure = async (courseId) => {
    try {
      setLoadingStructure(true);
      // Load units
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (unitsError) throw unitsError;

      // Load topics only if there are units
      let topicsData = [];
      if (unitsData && unitsData.length > 0) {
        const { data: topics, error: topicsError } = await supabase
          .from("topics")
          .select("*")
          .in(
            "unit_id",
            unitsData.map((u) => u.id)
          )
          .order("order_index", { ascending: true });

        if (topicsError) throw topicsError;
        topicsData = topics || [];
      }

      // Load subtopics only if there are topics
      let subtopicsData = [];
      if (topicsData && topicsData.length > 0) {
        const { data: subtopics, error: subtopicsError } = await supabase
          .from("subtopics")
          .select("*")
          .in(
            "topic_id",
            topicsData.map((t) => t.id)
          )
          .order("order_index", { ascending: true });

        if (subtopicsError) throw subtopicsError;
        subtopicsData = subtopics || [];
      }

      setUnits(unitsData || []);
      setTopics(topicsData || []);
      setSubtopics(subtopicsData || []);

      // Return the loaded data for immediate use
      return {
        units: unitsData || [],
        topics: topicsData || [],
        subtopics: subtopicsData || [],
      };
    } catch (error) {
      console.error("Error loading course structure:", error);
      toast.error("Failed to load course structure");
      throw error;
    } finally {
      setLoadingStructure(false);
    }
  };

  const handleCourseClick = async (course) => {
    setCourseClickLoading(true);
    setSelectedCourse(course);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setExpandedUnits({});
    setExpandedTopics({});
    setSidenavOpen(false);

    try {
      // Load course structure immediately
      const { units: loadedUnits } = await loadCourseStructure(course.id);

      // If there are units, immediately select the first one and navigate
      if (loadedUnits && loadedUnits.length > 0) {
        const firstUnit = loadedUnits[0];
        setSelectedUnit(firstUnit);
        // Navigate to the first unit URL
        navigate(`/courses/${course.id}/units/${firstUnit.id}`);
      } else {
        // If no units, just navigate to the course
        navigate(`/courses/${course.id}`);
      }
    } catch (error) {
      console.error("Error loading course structure:", error);
      // If there's an error, still navigate to the course
      navigate(`/courses/${course.id}`);
    } finally {
      setCourseClickLoading(false);
    }
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setExpandedTopics({});
    setSidenavOpen(false);
    navigate(`/courses/${selectedCourse.id}/units/${unit.id}`);
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    setSidenavOpen(false);
    navigate(
      `/courses/${selectedCourse.id}/units/${selectedUnit.id}/topics/${topic.id}`
    );
  };

  const handleSubtopicClick = (subtopic) => {
    setSelectedSubtopic(subtopic);
    navigate(
      `/courses/${selectedCourse.id}/units/${selectedUnit.id}/topics/${selectedTopic.id}/subtopics/${subtopic.id}`
    );
  };

  const toggleUnitExpansion = (unitId) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const toggleTopicExpansion = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const goBackToUnits = () => {
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setExpandedTopics({});
    navigate(`/courses/${selectedCourse.id}/units/${selectedUnit.id}`);
  };

  const goBackToTopics = () => {
    setSelectedSubtopic(null);
    navigate(
      `/courses/${selectedCourse.id}/units/${selectedUnit.id}/topics/${selectedTopic.id}`
    );
  };

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setExpandedUnits({});
    setExpandedTopics({});
    navigate("/courses");
  };

  const goBack = () => {
    if (selectedSubtopic) {
      goBackToTopics();
    } else if (selectedTopic) {
      goBackToUnits();
    } else if (selectedUnit) {
      setSelectedUnit(null);
      navigate(`/courses/${selectedCourse.id}`);
    } else if (selectedCourse) {
      setSelectedCourse(null);
      navigate("/courses");
    }
  };

  // --- Progress RPC helpers ---
  const fetchCourseProgress = async (courseId) => {
    try {
      const { data, error } = await supabase.rpc("get_course_progress", {
        student_uuid: STUDENT_ID,
        course_id_param: courseId,
      });
      if (error) throw error;
      setCourseProgress(data && data.length > 0 ? data[0] : null);
    } catch (e) {
      setCourseProgress(null);
    }
  };

  const fetchUnitProgress = async (unitId) => {
    try {
      const { data, error } = await supabase.rpc("get_unit_progress", {
        student_uuid: STUDENT_ID,
        unit_id_param: unitId,
      });
      if (error) throw error;
      setUnitProgress((prev) => ({ ...prev, [unitId]: data && data[0] }));
    } catch (e) {
      setUnitProgress((prev) => ({ ...prev, [unitId]: null }));
    }
  };

  const fetchTopicProgress = async (topicId) => {
    try {
      const { data, error } = await supabase.rpc("get_topic_progress", {
        student_uuid: STUDENT_ID,
        topic_id_param: topicId,
      });
      if (error) throw error;
      setTopicProgress((prev) => ({ ...prev, [topicId]: data && data[0] }));
    } catch (e) {
      setTopicProgress((prev) => ({ ...prev, [topicId]: null }));
    }
  };

  const markInProgress = async ({
    course_id,
    unit_id,
    topic_id,
    subtopic_id,
  }) => {
    try {
      await supabase.rpc("mark_item_in_progress", {
        student_uuid: STUDENT_ID,
        course_id_param: course_id,
        unit_id_param: unit_id || null,
        topic_id_param: topic_id || null,
        subtopic_id_param: subtopic_id || null,
      });
    } catch (e) {}
  };

  const markCompleted = async ({
    course_id,
    unit_id,
    topic_id,
    subtopic_id,
  }) => {
    try {
      await supabase.rpc("mark_item_completed", {
        student_uuid: STUDENT_ID,
        course_id_param: course_id,
        unit_id_param: unit_id || null,
        topic_id_param: topic_id || null,
        subtopic_id_param: subtopic_id || null,
      });
      // Refresh progress
      if (selectedCourse) fetchCourseProgress(selectedCourse.id);
      if (selectedUnit) fetchUnitProgress(selectedUnit.id);
      if (selectedTopic) fetchTopicProgress(selectedTopic.id);
    } catch (e) {}
  };

  // Breadcrumb Component
  const Breadcrumb = () => {
    if (!selectedCourse) return null;

    const breadcrumbItems = [
      { label: "Courses", path: "/courses", active: !selectedUnit },
      {
        label: selectedCourse.name,
        path: `/courses/${selectedCourse.id}`,
        active: selectedUnit && !selectedTopic,
      },
    ];

    if (selectedUnit) {
      breadcrumbItems.push({
        label: selectedUnit.title,
        path: `/courses/${selectedCourse.id}/units/${selectedUnit.id}`,
        active: selectedTopic && !selectedSubtopic,
      });
    }

    if (selectedTopic) {
      breadcrumbItems.push({
        label: selectedTopic.title,
        path: `/courses/${selectedCourse.id}/units/${selectedUnit.id}/topics/${selectedTopic.id}`,
        active: selectedSubtopic,
      });
    }

    if (selectedSubtopic) {
      breadcrumbItems.push({
        label: selectedSubtopic.title,
        path: `/courses/${selectedCourse.id}/units/${selectedUnit.id}/topics/${selectedTopic.id}/subtopics/${selectedSubtopic.id}`,
        active: true,
      });
    }

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            <button
              onClick={() => navigate(item.path)}
              className={`hover:text-gray-900 transition-colors ${
                item.active ? "text-blue-600 font-medium" : ""
              }`}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  // Sidenav Component
  const Sidenav = () => {
    if (!selectedCourse) return null;

    // If subtopic is selected, show topics only (same as topic view)
    if (selectedSubtopic) {
      const unitTopics = topics.filter((t) => t.unit_id === selectedUnit.id);
      return (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[90%] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidenavOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 lg:w-80 lg:border-r lg:border-gray-200 lg:bg-gray-50`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
            <button
              onClick={() => setSidenavOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {/* Back to Units Button */}
              <button
                onClick={goBackToTopics}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Topics</span>
              </button>

              {/* Unit Info */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedUnit.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedCourse.name}
                </p>
              </div>

              {/* Topics List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                  Topics
                </h4>
                {unitTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTopic?.id === topic.id
                        ? "bg-blue-100 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {topic.title}
                        </h5>
                        {topic.short_description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {topic.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If topic is selected, show topics only
    if (selectedTopic) {
      const unitTopics = topics.filter((t) => t.unit_id === selectedUnit.id);
      return (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[90%] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidenavOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 lg:w-80 lg:border-r lg:border-gray-200 lg:bg-gray-50`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
            <button
              onClick={() => setSidenavOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {/* Back to Units Button */}
              <button
                onClick={goBackToUnits}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Units</span>
              </button>

              {/* Unit Info */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedUnit.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedCourse.name}
                </p>
              </div>

              {/* Topics List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                  Topics
                </h4>
                {unitTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTopic?.id === topic.id
                        ? "bg-blue-100 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {topic.title}
                        </h5>
                        {topic.short_description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {topic.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show units with collapsible topics
    return (
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[90%] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidenavOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:w-80 lg:border-r lg:border-gray-200 lg:bg-gray-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Units</h2>
          <button
            onClick={() => setSidenavOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full overflow-y-auto">
          <div className="p-4">
            {/* Back to Courses Button */}
            <button
              onClick={goBackToCourses}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Courses</span>
            </button>

            {/* Course Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedCourse.name}
              </h3>
              <p className="text-sm text-gray-600">
                Grade {selectedCourse.grade} •{" "}
                {
                  pakistanBoards.find((b) => b.value === selectedCourse.board)
                    ?.label
                }
              </p>
            </div>

            {/* Units List with Collapsible Topics */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                Units
              </h4>
              {units.map((unit) => {
                const unitTopics = topics.filter((t) => t.unit_id === unit.id);
                const isExpanded = expandedUnits[unit.id];
                const isSelected = selectedUnit?.id === unit.id;

                return (
                  <div key={unit.id} className="space-y-1">
                    {/* Unit Item */}
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-green-100 border border-green-200"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleUnitClick(unit)}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {unit.title}
                          </h5>
                          {unit.short_description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {unit.short_description}
                            </p>
                          )}
                        </div>
                        {unitTopics.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUnitExpansion(unit.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Collapsible Topics */}
                    {isExpanded && unitTopics.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {unitTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => handleTopicClick(topic)}
                          >
                            <div className="flex items-center gap-2">
                              <List className="w-3 h-3 text-blue-600" />
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 text-xs">
                                  {topic.title}
                                </h6>
                                {topic.short_description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {topic.short_description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Subtopic Detail View with Sidenav
  if (selectedSubtopic) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Fixed Mobile Menu Button */}
        <button
          onClick={() => setSidenavOpen(true)}
          style={sidenavOpen ? { display: "none" } : {}}
          className="fixed top-4 right-4 z-50 lg:hidden bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Sidenav */}
        <Sidenav />

        {/* Mobile overlay */}
        {sidenavOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidenavOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb />
              {selectedSubtopic.short_description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Overview:</h4>
                  <p className="text-gray-700">
                    {selectedSubtopic.short_description}
                  </p>
                </div>
              )}

              {selectedSubtopic.main_description ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <MarkdownRenderer
                    content={selectedSubtopic.main_description}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content available for this subtopic</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Topic Detail View with Sidenav
  if (selectedTopic) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Fixed Mobile Menu Button */}
        <button
          onClick={() => setSidenavOpen(true)}
          style={sidenavOpen ? { display: "none" } : {}}
          className="fixed top-4 right-4 z-50 lg:hidden bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Sidenav */}
        <Sidenav />

        {/* Mobile overlay */}
        {sidenavOpen && (
          <div
            className="fixed inset-0 bg-black/25 z-40 lg:hidden"
            onClick={() => setSidenavOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb />
              {selectedTopic.short_description && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Overview:</h4>
                  <p className="text-gray-700">
                    {selectedTopic.short_description}
                  </p>
                </div>
              )}

              {selectedTopic.main_description ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <MarkdownRenderer content={selectedTopic.main_description} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content available for this topic</p>
                </div>
              )}

              {/* Subtopics */}
              {(() => {
                const topicSubtopics = subtopics.filter(
                  (s) => s.topic_id === selectedTopic.id && !s.parent_id
                );
                if (topicSubtopics.length > 0) {
                  return (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Subtopics
                      </h3>
                      <div className="space-y-2">
                        {topicSubtopics.map((subtopic) => (
                          <div
                            key={subtopic.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSubtopicClick(subtopic)}
                          >
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-purple-600" />
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {subtopic.title}
                                </h5>
                                {subtopic.short_description && (
                                  <p className="text-sm text-gray-600">
                                    {subtopic.short_description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unit Detail View with Sidenav
  if (selectedUnit) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Fixed Mobile Menu Button */}
        <button
          onClick={() => setSidenavOpen(true)}
          style={sidenavOpen ? { display: "none" } : {}}
          className="fixed top-4 right-4 z-50 lg:hidden bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Sidenav */}
        <Sidenav />

        {/* Mobile overlay */}
        {sidenavOpen && (
          <div
            className="fixed inset-0 bg-black/25 z-40 lg:hidden"
            onClick={() => setSidenavOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <Breadcrumb />
              {/* Unit Description */}
              {selectedUnit.short_description && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Unit Overview:
                  </h4>
                  <p className="text-gray-700">
                    {selectedUnit.short_description}
                  </p>
                </div>
              )}

              {/* Unit Main Content */}
              {selectedUnit.main_description ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <MarkdownRenderer content={selectedUnit.main_description} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 mb-6">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content available for this unit</p>
                </div>
              )}

              {/* Topics */}
              <div className="space-y-4">
                {loadingStructure ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading topics...</p>
                  </div>
                ) : (
                  (() => {
                    const unitTopics = topics.filter(
                      (t) => t.unit_id === selectedUnit.id
                    );
                    return unitTopics.length === 0 ? (
                      <div className="text-center py-12">
                        <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No topics available
                        </h3>
                        <p className="text-gray-500">
                          This unit doesn't have any topics yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unitTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="transition-all duration-200 "
                          >
                            <div
                              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => handleTopicClick(topic)}
                            >
                              <div className="flex items-center gap-3">
                                <List className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h4 className=" text-gray-900">
                                    {topic.title}
                                  </h4>
                                  {topic.short_description && (
                                    <p className="text-gray-600 text-sm mt-1">
                                      {topic.short_description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Detail View
  if (selectedCourse) {
    if (urlLoading || courseClickLoading) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading course...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-6">
        <Toaster position="top-right" />

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCourse.name}
            </h1>
            <p className="text-gray-600">
              Grade {selectedCourse.grade} •{" "}
              {
                pakistanBoards.find((b) => b.value === selectedCourse.board)
                  ?.label
              }
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {courseProgress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">
                Progress
              </span>
              <span className="text-sm font-medium text-blue-700">
                {courseProgress.progress_percentage}%
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress.progress_percentage}%` }}
              ></div>
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Units: {courseProgress.units_completed} completed</span>
              <span>Topics: {courseProgress.topics_completed} completed</span>
              <span>
                Subtopics: {courseProgress.subtopics_completed} completed
              </span>
            </div>
          </div>
        )}

        {/* Course Description */}
        {selectedCourse.description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Course Overview:</h4>
            <p className="text-gray-700">{selectedCourse.description}</p>
          </div>
        )}

        {/* Units */}
        <div className="space-y-4">
          {loadingStructure ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading course content...</p>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No units available
              </h3>
              <p className="text-gray-500">
                This course doesn't have any units yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 ${
                    courseClickLoading
                      ? "cursor-not-allowed opacity-75"
                      : "hover:shadow-md hover:border-gray-300 cursor-pointer"
                  }`}
                  onClick={() => !courseClickLoading && handleUnitClick(unit)}
                >
                  <div className="flex items-start gap-4">
                    <BookOpen className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {unit.title}
                      </h3>
                      {unit.short_description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {unit.short_description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {topics.filter((t) => t.unit_id === unit.id).length}{" "}
                          Topics
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error display
  if (urlError && !loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Toaster position="top-right" />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-600">MEd Courses</h1>
          <p className="text-gray-600">
            New way of learning, try following courses.
          </p>
        </div>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">Course Not Found</h3>
          </div>
          <p className="text-red-700 mb-4">{urlError}</p>
          <button
            onClick={() => {
              setUrlError(null);
              navigate("/courses");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Main courses view
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600">MEd Courses</h1>
        <p className="text-gray-600">
          New way of learning, try following courses.
        </p>
      </div>

      {/* Breadcrumb for root */}
      {location.pathname !== "/" && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => navigate("/")}
            className="hover:text-gray-900 transition-colors"
          >
            Courses
          </button>
        </nav>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses available
            </h3>
            <p className="text-gray-500">
              There are no courses available at the moment.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 ${
                courseClickLoading
                  ? "cursor-not-allowed opacity-75"
                  : "hover:border-gray-300 cursor-pointer"
              }`}
              onClick={() => !courseClickLoading && handleCourseClick(course)}
            >
              <div className="flex items-start gap-4">
                <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.name}
                  </h3>
                  {course.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Grade {course.grade}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="truncate">
                      {pakistanBoards.find((b) => b.value === course.board)
                        ?.label || course.board}
                    </span>
                  </div>
                </div>
                {courseClickLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 flex-shrink-0"></div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
