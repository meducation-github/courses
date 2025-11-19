import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Plus,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
  List,
  Hash,
  GripVertical,
  Eye,
  Sparkles,
  ArrowLeft,
  Download,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../config/env";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MarkdownRenderer from "./MarkdownRenderer";
import SimpleRichTextEditor from "./SimpleRichTextEditor";
import LoadCourses from "../../components/load-courses";
import { Button } from "../../components/ui/button";

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

const CreateCourses = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Hardcoded institute ID for now
  const INSTITUTE_ID = "550e8400-e29b-41d4-a716-446655440000";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);

  // Course structure state
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [courseClickLoading, setCourseClickLoading] = useState(false);

  // Error state
  const [urlError, setUrlError] = useState(null);

  // Confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Modal context
  const [modalContext, setModalContext] = useState({});

  // AI Description Generation states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingType, setViewingType] = useState(null);
  const [regenerateAI, setRegenerateAI] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showLoadCourses, setShowLoadCourses] = useState(false);
  const [gradeFilter, setGradeFilter] = useState("");
  const [boardFilter, setBoardFilter] = useState("");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Form data
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
    grade_id: "",
    board: "",
  });

  const [unitForm, setUnitForm] = useState({
    title: "",
    short_description: "",
    main_description: "",
  });

  const [topicForm, setTopicForm] = useState({
    title: "",
    short_description: "",
    main_description: "",
  });

  const [subtopicForm, setSubtopicForm] = useState({
    title: "",
    short_description: "",
    main_description: "",
    type: "subtopic",
  });

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Handle direct URL access and sync with state
  useEffect(() => {
    const handleDirectUrlAccess = async () => {
      // If no courseId in URL, clear selections to show main courses list
      if (!courseId) {
        setSelectedCourse(null);
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
      const course = courses.find((c) => c.id === courseId);

      if (course && (!selectedCourse || selectedCourse.id !== courseId)) {
        setUrlLoading(true);
        setUrlError(null);
        setSelectedCourse(course);

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

  // Load course structure when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadCourseStructure(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects_courses")
        .select("*")
        .eq("institute_id", INSTITUTE_ID)
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
        .eq("institute_id", INSTITUTE_ID)
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
          .eq("institute_id", INSTITUTE_ID)
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
          .eq("institute_id", INSTITUTE_ID)
          .order("order_index", { ascending: true });

        if (subtopicsError) throw subtopicsError;
        subtopicsData = subtopics || [];
      }

      setUnits(unitsData || []);
      setTopics(topicsData || []);
      setSubtopics(subtopicsData || []);
    } catch (error) {
      console.error("Error loading course structure:", error);
      toast.error("Failed to load course structure");
    } finally {
      setLoadingStructure(false);
    }
  };

  const createCourse = async () => {
    try {
      // Validation
      if (!courseForm.name.trim()) {
        toast.error("Course name is required");
        return;
      }
      if (!courseForm.grade_id) {
        toast.error("Please select a grade");
        return;
      }
      if (!courseForm.board) {
        toast.error("Please select a board");
        return;
      }

      setSaving(true);
      const { data, error } = await supabase
        .from("subjects_courses")
        .insert([{ ...courseForm, institute_id: INSTITUTE_ID }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCourses([data, ...courses]);
      setCourseForm({ title: "", description: "", grade: "", board: "" });
      setShowCreateCourseModal(false);
      toast.success("Course created successfully");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  const createUnit = async () => {
    try {
      // Validation
      if (!unitForm.title.trim()) {
        toast.error("Unit title is required");
        return;
      }

      setSaving(true);

      const newUnitData = {
        ...unitForm,
        course_id: selectedCourse.id,
        order_index: units.length + 1,
        main_description: "", // Will be updated by AI function
        institute_id: INSTITUTE_ID,
      };

      const { data, error } = await supabase
        .from("units")
        .insert([newUnitData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Generate AI description after unit is created
      const context = {
        courseTitle: selectedCourse.name,
        courseDescription: selectedCourse.description,
      };

      await generateAIDescription(
        "unit",
        unitForm.title,
        unitForm.short_description,
        context,
        data.id
      );

      // Reload the units to get the updated data
      await loadCourseStructure(selectedCourse.id);

      setUnitForm({ title: "", short_description: "", main_description: "" });
      setShowUnitModal(false);
      toast.success("Unit created successfully");
    } catch (error) {
      console.error("Error creating unit:", error);
      toast.error("Failed to create unit");
    } finally {
      setSaving(false);
    }
  };

  const createTopic = async () => {
    try {
      // Validation
      if (!topicForm.title.trim()) {
        toast.error("Topic title is required");
        return;
      }

      setSaving(true);

      const newTopicData = {
        ...topicForm,
        unit_id: modalContext.unitId,
        order_index:
          topics.filter((t) => t.unit_id === modalContext.unitId).length + 1,
        main_description: "", // Will be updated by AI function
        institute_id: INSTITUTE_ID,
      };

      const { data, error } = await supabase
        .from("topics")
        .insert([newTopicData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Get unit context and generate AI description
      const unit = units.find((u) => u.id === modalContext.unitId);
      const context = {
        unitTitle: unit?.title,
        unitDescription: unit?.short_description,
      };

      await generateAIDescription(
        "topic",
        topicForm.title,
        topicForm.short_description,
        context,
        data.id
      );

      // Reload the course structure to get the updated data
      await loadCourseStructure(selectedCourse.id);

      setTopicForm({ title: "", short_description: "", main_description: "" });
      setShowTopicModal(false);
      toast.success("Topic created successfully");
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Failed to create topic");
    } finally {
      setSaving(false);
    }
  };

  const createSubtopic = async () => {
    try {
      // Validation
      if (!subtopicForm.title.trim()) {
        toast.error("Subtopic title is required");
        return;
      }

      setSaving(true);

      const newSubtopicData = {
        ...subtopicForm,
        topic_id: modalContext.topicId,
        parent_id: modalContext.parentId || null,
        order_index:
          subtopics.filter(
            (s) =>
              s.topic_id === modalContext.topicId &&
              s.parent_id === (modalContext.parentId || null)
          ).length + 1,
        main_description: "", // Will be updated by AI function
        institute_id: INSTITUTE_ID,
      };

      const { data, error } = await supabase
        .from("subtopics")
        .insert([newSubtopicData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Get topic and unit context and generate AI description
      const topic = topics.find((t) => t.id === modalContext.topicId);
      const unit = units.find((u) => u.id === topic?.unit_id);
      const context = {
        topicTitle: topic?.title,
        topicDescription: topic?.short_description,
        unitTitle: unit?.title,
      };

      await generateAIDescription(
        "subtopic",
        subtopicForm.title,
        subtopicForm.short_description,
        context,
        data.id
      );

      // Reload the course structure to get the updated data
      await loadCourseStructure(selectedCourse.id);

      setSubtopicForm({
        title: "",
        short_description: "",
        main_description: "",
        type: "subtopic",
      });
      setShowSubtopicModal(false);
      toast.success("Subtopic created successfully");
    } catch (error) {
      console.error("Error creating subtopic:", error);
      toast.error("Failed to create subtopic");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id, type) => {
    try {
      // Set confirmation state
      setDeleteConfirmation({ id, type });
    } catch (error) {
      console.error(`Error setting delete confirmation:`, error);
    }
  };

  const confirmDelete = async () => {
    try {
      const { id, type } = deleteConfirmation;
      let error;

      if (type === "course") {
        const { error: courseError } = await supabase
          .from("subjects_courses")
          .delete()
          .eq("id", id)
          .eq("institute_id", INSTITUTE_ID);
        error = courseError;
        if (!error) {
          setCourses(courses.filter((c) => c.id !== id));
        }
      } else if (type === "unit") {
        const { error: unitError } = await supabase
          .from("units")
          .delete()
          .eq("id", id)
          .eq("institute_id", INSTITUTE_ID);
        error = unitError;
        if (!error) {
          setUnits(units.filter((u) => u.id !== id));
          // Also delete related topics and subtopics from state
          const unitTopics = topics.filter((t) => t.unit_id === id);
          const topicIds = unitTopics.map((t) => t.id);
          setTopics(topics.filter((t) => t.unit_id !== id));
          setSubtopics(subtopics.filter((s) => !topicIds.includes(s.topic_id)));
        }
      } else if (type === "topic") {
        const { error: topicError } = await supabase
          .from("topics")
          .delete()
          .eq("id", id)
          .eq("institute_id", INSTITUTE_ID);
        error = topicError;
        if (!error) {
          setTopics(topics.filter((t) => t.id !== id));
          setSubtopics(subtopics.filter((s) => s.topic_id !== id));
        }
      } else if (type === "subtopic") {
        const { error: subtopicError } = await supabase
          .from("subtopics")
          .delete()
          .eq("id", id)
          .eq("institute_id", INSTITUTE_ID);
        error = subtopicError;
        if (!error) {
          setSubtopics(subtopics.filter((s) => s.id !== id));
          // Also delete child subtopics from state
          setSubtopics((prev) => prev.filter((s) => s.parent_id !== id));
        }
      }

      if (error) {
        throw error;
      }

      setDeleteConfirmation(null);
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${deleteConfirmation?.type}:`, error);
      toast.error(`Failed to delete ${deleteConfirmation?.type}`);
    }
  };

  const startEdit = (item, type) => {
    setEditingItem(item);
    setEditingType(type);

    if (type === "unit") {
      setUnitForm(item);
    } else if (type === "topic") {
      setTopicForm(item);
    } else if (type === "subtopic") {
      setSubtopicForm(item);
    }
  };

  const saveEdit = async () => {
    try {
      // Validation
      const title =
        editingType === "unit"
          ? unitForm.title
          : editingType === "topic"
          ? topicForm.title
          : subtopicForm.title;

      if (!title.trim()) {
        toast.error(`${editingType} title is required`);
        return;
      }

      setSaving(true);
      let error;

      // Save the basic form data first
      if (editingType === "unit") {
        const { error: unitError } = await supabase
          .from("units")
          .update(unitForm)
          .eq("id", editingItem.id)
          .eq("institute_id", INSTITUTE_ID);
        error = unitError;
        if (!error) {
          setUnits(
            units.map((u) =>
              u.id === editingItem.id ? { ...u, ...unitForm } : u
            )
          );
        }
      } else if (editingType === "topic") {
        const { error: topicError } = await supabase
          .from("topics")
          .update(topicForm)
          .eq("id", editingItem.id)
          .eq("institute_id", INSTITUTE_ID);
        error = topicError;
        if (!error) {
          setTopics(
            topics.map((t) =>
              t.id === editingItem.id ? { ...t, ...topicForm } : t
            )
          );
        }
      } else if (editingType === "subtopic") {
        const { error: subtopicError } = await supabase
          .from("subtopics")
          .update(subtopicForm)
          .eq("id", editingItem.id)
          .eq("institute_id", INSTITUTE_ID);
        error = subtopicError;
        if (!error) {
          setSubtopics(
            subtopics.map((s) =>
              s.id === editingItem.id ? { ...s, ...subtopicForm } : s
            )
          );
        }
      }

      if (error) {
        throw error;
      }

      // Handle AI regeneration if requested
      if (regenerateAI) {
        let context = {};

        if (editingType === "unit") {
          context = {
            courseTitle: selectedCourse.name,
            courseDescription: selectedCourse.description,
          };
        } else if (editingType === "topic") {
          const unit = units.find((u) => u.id === editingItem.unit_id);
          context = {
            unitTitle: unit?.title,
            unitDescription: unit?.short_description,
          };
        } else if (editingType === "subtopic") {
          const topic = topics.find((t) => t.id === editingItem.topic_id);
          const unit = units.find((u) => u.id === topic?.unit_id);
          context = {
            topicTitle: topic?.title,
            topicDescription: topic?.short_description,
            unitTitle: unit?.title,
          };
        }

        await generateAIDescription(
          editingType,
          title,
          editingType === "unit"
            ? unitForm.short_description
            : editingType === "topic"
            ? topicForm.short_description
            : subtopicForm.short_description,
          context,
          editingItem.id
        );

        // Reload the course structure to get the updated AI description
        await loadCourseStructure(selectedCourse.id);
      }

      setEditingItem(null);
      setEditingType(null);
      setRegenerateAI(false);
      toast.success(`${editingType} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${editingType}:`, error);
      toast.error(`Failed to update ${editingType}`);
    } finally {
      setSaving(false);
    }
  };

  // View functionality
  const openViewModal = (item, type) => {
    setViewingItem(item);
    setViewingType(type);
    setShowViewModal(true);
  };

  // AI Description Generation Function
  const generateAIDescription = async (
    type,
    title,
    short_description,
    context,
    item_id
  ) => {
    try {
      setGeneratingAI(true);

      const response = await supabase.functions.invoke("create-description", {
        body: {
          type,
          title,
          short_description,
          grade_id: selectedCourse.grade_id,
          context,
          item_id,
        },
      });
      console.log(response);

      if (response.error) {
        throw new Error(
          response.error.message || "Failed to generate AI description"
        );
      }

      if (response.data.success) {
        toast.success("AI description generated successfully!");
        return response.data.main_description;
      } else {
        throw new Error(
          response.data.error || "Failed to generate description"
        );
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
      toast.error("Failed to generate AI description");
      return null;
    } finally {
      setGeneratingAI(false);
    }
  };

  const toggleExpand = (id, type) => {
    if (type === "unit") {
      setExpandedUnits((prev) => ({ ...prev, [id]: !prev[id] }));
    } else if (type === "topic") {
      setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const openModal = (modalType, context = {}) => {
    setModalContext(context);
    if (modalType === "unit") setShowUnitModal(true);
    else if (modalType === "topic") setShowTopicModal(true);
    else if (modalType === "subtopic") setShowSubtopicModal(true);
  };

  // Drag and Drop Handlers
  const handleUnitDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = units.findIndex((unit) => unit.id === active.id);
      const newIndex = units.findIndex((unit) => unit.id === over.id);

      const newUnits = arrayMove(units, oldIndex, newIndex);
      setUnits(newUnits);

      // Update order_index in database
      try {
        // Update each unit's order_index individually
        for (let i = 0; i < newUnits.length; i++) {
          const { error } = await supabase
            .from("units")
            .update({ order_index: i + 1 })
            .eq("id", newUnits[i].id)
            .eq("institute_id", INSTITUTE_ID);

          if (error) throw error;
        }

        toast.success("Units reordered successfully");
      } catch (error) {
        console.error("Error updating unit order:", error);
        toast.error("Failed to update unit order");
        // Revert to original order
        loadCourseStructure(selectedCourse.id);
      }
    }
  };

  const handleTopicDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Get the unit ID from the first topic to ensure we're only reordering within the same unit
      const activeTopic = topics.find((t) => t.id === active.id);
      const overTopic = topics.find((t) => t.id === over.id);

      if (
        activeTopic &&
        overTopic &&
        activeTopic.unit_id === overTopic.unit_id
      ) {
        const unitTopics = topics.filter(
          (t) => t.unit_id === activeTopic.unit_id
        );
        const oldIndex = unitTopics.findIndex(
          (topic) => topic.id === active.id
        );
        const newIndex = unitTopics.findIndex((topic) => topic.id === over.id);

        const newUnitTopics = arrayMove(unitTopics, oldIndex, newIndex);

        // Update the topics state with the new order
        const otherTopics = topics.filter(
          (t) => t.unit_id !== activeTopic.unit_id
        );
        const newTopics = [...otherTopics, ...newUnitTopics];
        setTopics(newTopics);

        // Update order_index in database
        try {
          // Update each topic's order_index individually
          for (let i = 0; i < newUnitTopics.length; i++) {
            const { error } = await supabase
              .from("topics")
              .update({ order_index: i + 1 })
              .eq("id", newUnitTopics[i].id)
              .eq("institute_id", INSTITUTE_ID);

            if (error) throw error;
          }

          toast.success("Topics reordered successfully");
        } catch (error) {
          console.error("Error updating topic order:", error);
          toast.error("Failed to update topic order");
          // Revert to original order
          loadCourseStructure(selectedCourse.id);
        }
      }
    }
  };

  const handleSubtopicDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Get the topic ID and parent ID from the first subtopic to ensure we're only reordering within the same scope
      const activeSubtopic = subtopics.find((s) => s.id === active.id);
      const overSubtopic = subtopics.find((s) => s.id === over.id);

      if (
        activeSubtopic &&
        overSubtopic &&
        activeSubtopic.topic_id === overSubtopic.topic_id &&
        activeSubtopic.parent_id === overSubtopic.parent_id
      ) {
        const scopeSubtopics = subtopics.filter(
          (s) =>
            s.topic_id === activeSubtopic.topic_id &&
            s.parent_id === activeSubtopic.parent_id
        );

        const oldIndex = scopeSubtopics.findIndex(
          (subtopic) => subtopic.id === active.id
        );
        const newIndex = scopeSubtopics.findIndex(
          (subtopic) => subtopic.id === over.id
        );

        const newScopeSubtopics = arrayMove(scopeSubtopics, oldIndex, newIndex);

        // Update the subtopics state with the new order
        const otherSubtopics = subtopics.filter(
          (s) =>
            !(
              s.topic_id === activeSubtopic.topic_id &&
              s.parent_id === activeSubtopic.parent_id
            )
        );
        const newSubtopics = [...otherSubtopics, ...newScopeSubtopics];
        setSubtopics(newSubtopics);

        // Update order_index in database
        try {
          // Update each subtopic's order_index individually
          for (let i = 0; i < newScopeSubtopics.length; i++) {
            const { error } = await supabase
              .from("subtopics")
              .update({ order_index: i + 1 })
              .eq("id", newScopeSubtopics[i].id)
              .eq("institute_id", INSTITUTE_ID);

            if (error) throw error;
          }

          toast.success("Subtopics reordered successfully");
        } catch (error) {
          console.error("Error updating subtopic order:", error);
          toast.error("Failed to update subtopic order");
          // Revert to original order
          loadCourseStructure(selectedCourse.id);
        }
      }
    }
  };

  // Breadcrumb Component
  const Breadcrumb = () => {
    if (!selectedCourse) return null;

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button
          onClick={() => navigate("/create-courses")}
          className="hover:text-gray-900 transition-colors"
        >
          Create Courses
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-blue-600 font-medium">{selectedCourse.name}</span>
      </nav>
    );
  };

  const renderSubtopics = (topicId, parentId = null, level = 0) => {
    const filteredSubtopics = subtopics.filter(
      (s) => s.topic_id === topicId && s.parent_id === parentId
    );

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSubtopicDragEnd}
      >
        <SortableContext
          items={filteredSubtopics.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredSubtopics.map((subtopic) => (
            <SortableSubtopic
              key={subtopic.id}
              subtopic={subtopic}
              topicId={topicId}
              parentId={parentId}
              level={level}
              onAddSubSubtopic={() =>
                openModal("subtopic", {
                  topicId,
                  parentId: subtopic.id,
                  type: "sub-subtopic",
                })
              }
              onEdit={() => startEdit(subtopic, "subtopic")}
              onDelete={() => deleteItem(subtopic.id, "subtopic")}
              renderChildSubtopics={() =>
                renderSubtopics(topicId, subtopic.id, level + 1)
              }
              onView={openViewModal}
            />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  const renderTopics = (unitId) => {
    const unitTopics = topics.filter((t) => t.unit_id === unitId);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleTopicDragEnd}
      >
        <SortableContext
          items={unitTopics.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {unitTopics.map((topic) => (
            <SortableTopic
              key={topic.id}
              topic={topic}
              unitId={unitId}
              isExpanded={expandedTopics[topic.id]}
              onToggleExpand={() => toggleExpand(topic.id, "topic")}
              onAddSubtopic={() => openModal("subtopic", { topicId: topic.id })}
              onEdit={() => startEdit(topic, "topic")}
              onDelete={() => deleteItem(topic.id, "topic")}
              renderSubtopics={() => renderSubtopics(topic.id)}
              onView={openViewModal}
            />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  // Sortable Components
  const SortableUnit = ({
    unit,
    onAddTopic,
    onEdit,
    onDelete,
    renderTopics,
    onView,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: unit.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white border border-gray-200 rounded-xl p-6 transition-all duration-200 ${
          isDragging
            ? "shadow-2xl scale-105 rotate-1"
            : "hover:shadow-lg hover:border-green-300 hover:bg-green-50/30"
        }`}
      >
        {/* Main Unit Content - Clickable */}
        <div className="cursor-pointer" onClick={() => onView(unit, "unit")}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(unit.id, "unit");
                }}
                className="text-green-600 hover:text-green-700 transition-colors p-1 hover:bg-green-100 rounded-lg"
              >
                {expandedUnits[unit.id] ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Drag to reorder"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {unit.title}
                </h3>
                {unit.short_description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {unit.short_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Only show when expanded */}
        {expandedUnits[unit.id] && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView(unit, "unit")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Description"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => onEdit(unit, "unit")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(unit.id, "unit")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
            <button
              onClick={() => onAddTopic("topic", { unitId: unit.id })}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
              title="Add Topic"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>
        )}

        {/* Topics Section */}
        {expandedUnits[unit.id] && (
          <div className="mt-6 space-y-3">{renderTopics(unit.id)}</div>
        )}
      </div>
    );
  };

  const SortableTopic = ({
    topic,
    unitId,
    isExpanded,
    onToggleExpand,
    onAddSubtopic,
    onEdit,
    onDelete,
    renderSubtopics,
    onView,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: topic.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`ml-8 transition-all duration-200 ${
          isDragging
            ? "shadow-xl bg-blue-50 scale-105 rotate-1"
            : "hover:shadow-md"
        }`}
      >
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:bg-blue-100/50 transition-colors">
          {/* Main Topic Content - Clickable */}
          <div
            className="cursor-pointer"
            onClick={() => onView(topic, "topic")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors p-1 hover:bg-blue-200 rounded-lg"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-blue-200 rounded-lg transition-colors"
                  title="Drag to reorder"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-3 h-3 text-gray-400" />
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <List className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {topic.title}
                  </h4>
                  {topic.short_description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {topic.short_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show when expanded */}
          {isExpanded && (
            <div className="flex items-center justify-between pt-3 border-t border-blue-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(topic, "topic")}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Description"
                >
                  <Eye className="w-3 h-3" />
                  View Details
                </button>
                <button
                  onClick={() => onEdit(topic, "topic")}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(topic.id, "topic")}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
              <button
                onClick={() => onAddSubtopic("subtopic", { topicId: topic.id })}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                title="Add Subtopic"
              >
                <Plus className="w-3 h-3" />
                Add Subtopic
              </button>
            </div>
          )}
        </div>

        {/* Subtopics Section */}
        {isExpanded && <div className="ml-6 mt-3">{renderSubtopics()}</div>}
      </div>
    );
  };

  const SortableSubtopic = ({
    subtopic,
    topicId,
    parentId,
    level,
    onAddSubSubtopic,
    onEdit,
    onDelete,
    renderChildSubtopics,
    onView,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: subtopic.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    };

    const marginLeft = (level + 1) * 8; // Use fixed margin instead of dynamic class

    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          marginLeft: `${marginLeft}px`,
        }}
        className={`transition-all duration-200 ${
          isDragging
            ? "shadow-lg bg-gray-100 scale-105 rotate-1"
            : "hover:shadow-sm"
        }`}
      >
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:bg-gray-100/70 transition-colors mb-2">
          {/* Main Subtopic Content - Clickable */}
          <div
            className="cursor-pointer"
            onClick={() => onView(subtopic, "subtopic")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Drag to reorder"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-3 h-3 text-gray-400" />
                </div>
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Hash className="w-3 h-3 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">
                    {subtopic.title}
                  </h5>
                  {subtopic.short_description && (
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {subtopic.short_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(subtopic, "subtopic")}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="View Description"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
              <button
                onClick={() => onEdit(subtopic, "subtopic")}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => onDelete(subtopic.id, "subtopic")}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
            <button
              onClick={onAddSubSubtopic}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white hover:bg-purple-700 rounded transition-colors"
              title="Add Sub-subtopic"
            >
              <Plus className="w-3 h-3" />
              Add Sub
            </button>
          </div>
        </div>
        {renderChildSubtopics()}
      </div>
    );
  };

  // Error display
  if (urlError && !loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Toaster position="top-right" />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Courses</h1>
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
              navigate("/create-courses");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Create Courses
          </button>
        </div>
      </div>
    );
  }

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

        {/* Course Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedCourse(null);
                navigate("/create-courses");
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Courses
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCourse.name}
              </h1>
              <p className="text-gray-600">
                Grade ID: {selectedCourse.grade_id} •{" "}
                {
                  pakistanBoards.find((b) => b.value === selectedCourse.board)
                    ?.label
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUnitModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </button>
        </div>

        {/* Course Structure */}
        <div className="space-y-6">
          {/* Drag and Drop Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-blue-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GripVertical className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">
                  💡 Drag and Drop Tip
                </p>
                <p className="text-sm text-blue-700">
                  Use the grip handle (⋮⋮) to reorder units, topics, and
                  subtopics. Items can only be reordered within their own level.
                </p>
              </div>
            </div>
          </div>

          {loadingStructure ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4 text-lg">
                Loading course structure...
              </p>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No units yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first unit to organize your course
                content
              </p>
              <button
                onClick={() => setShowUnitModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Unit
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleUnitDragEnd}
              >
                <SortableContext
                  items={units.map((u) => u.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {units.map((unit) => (
                    <SortableUnit
                      key={unit.id}
                      unit={unit}
                      onAddTopic={openModal}
                      onEdit={startEdit}
                      onDelete={deleteItem}
                      renderTopics={renderTopics}
                      onView={openViewModal}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Modals */}
        {showUnitModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Unit</h3>
                <button
                  onClick={() => setShowUnitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={unitForm.title}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter unit title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={unitForm.short_description}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        short_description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Brief description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowUnitModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createUnit}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Unit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar modals for Topic and Subtopic */}
        {showTopicModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 scroll-auto w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Topic</h3>
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={topicForm.title}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter topic title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={topicForm.short_description}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        short_description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Brief description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowTopicModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTopic}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Topic"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSubtopicModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 scroll-auto w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Add New{" "}
                  {modalContext.type === "sub-subtopic"
                    ? "Sub-subtopic"
                    : "Subtopic"}
                </h3>
                <button
                  onClick={() => setShowSubtopicModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={subtopicForm.title}
                    onChange={(e) =>
                      setSubtopicForm({
                        ...subtopicForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter subtopic title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={subtopicForm.short_description}
                    onChange={(e) =>
                      setSubtopicForm({
                        ...subtopicForm,
                        short_description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Brief description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSubtopicModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createSubtopic}
                    disabled={saving}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      `Create ${
                        modalContext.type === "sub-subtopic"
                          ? "Sub-subtopic"
                          : "Subtopic"
                      }`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit {editingType}</h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEditingType(null);
                    setRegenerateAI(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={
                      editingType === "unit"
                        ? unitForm.title
                        : editingType === "topic"
                        ? topicForm.title
                        : subtopicForm.title
                    }
                    onChange={(e) => {
                      if (editingType === "unit") {
                        setUnitForm({ ...unitForm, title: e.target.value });
                      } else if (editingType === "topic") {
                        setTopicForm({ ...topicForm, title: e.target.value });
                      } else {
                        setSubtopicForm({
                          ...subtopicForm,
                          title: e.target.value,
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={
                      editingType === "unit"
                        ? unitForm.short_description
                        : editingType === "topic"
                        ? topicForm.short_description
                        : subtopicForm.short_description
                    }
                    onChange={(e) => {
                      if (editingType === "unit") {
                        setUnitForm({
                          ...unitForm,
                          short_description: e.target.value,
                        });
                      } else if (editingType === "topic") {
                        setTopicForm({
                          ...topicForm,
                          short_description: e.target.value,
                        });
                      } else {
                        setSubtopicForm({
                          ...subtopicForm,
                          short_description: e.target.value,
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Description
                  </label>
                  <SimpleRichTextEditor
                    value={
                      editingType === "unit"
                        ? unitForm.main_description || ""
                        : editingType === "topic"
                        ? topicForm.main_description || ""
                        : subtopicForm.main_description || ""
                    }
                    onChange={(value) => {
                      if (editingType === "unit") {
                        setUnitForm({
                          ...unitForm,
                          main_description: value,
                        });
                      } else if (editingType === "topic") {
                        setTopicForm({
                          ...topicForm,
                          main_description: value,
                        });
                      } else {
                        setSubtopicForm({
                          ...subtopicForm,
                          main_description: value,
                        });
                      }
                    }}
                    placeholder="Write a detailed description with rich formatting..."
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="regenerateAI"
                    checked={regenerateAI}
                    onChange={(e) => setRegenerateAI(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="regenerateAI"
                    className="text-sm text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Regenerate AI description
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will overwrite the current main description with a
                      new AI-generated one. Content is stored as clean markdown.
                    </p>
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setEditingType(null);
                      setRegenerateAI(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving || (regenerateAI && generatingAI)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {regenerateAI && generatingAI
                          ? "Generating AI..."
                          : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 scroll-auto w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete this {deleteConfirmation.type}
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirmation(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewingItem && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewingType === "unit"
                      ? "Unit"
                      : viewingType === "topic"
                      ? "Topic"
                      : "Subtopic"}
                    : {viewingItem.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {viewingType === "unit" && "Course Unit"}
                    {viewingType === "topic" && "Unit Topic"}
                    {viewingType === "subtopic" && "Topic Subtopic"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingItem(null);
                      setViewingType(null);
                      startEdit(viewingItem, viewingType);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingItem(null);
                      setViewingType(null);
                      deleteItem(viewingItem.id, viewingType);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingItem(null);
                      setViewingType(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {viewingItem.short_description && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      Short Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {viewingItem.short_description}
                    </p>
                  </div>
                )}

                {viewingItem.main_description ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Main Description
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer
                        content={viewingItem.main_description}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Main Description
                    </h4>
                    <p className="text-gray-600">
                      This {viewingType} doesn't have a detailed description
                      yet.
                    </p>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setViewingItem(null);
                        setViewingType(null);
                        startEdit(viewingItem, viewingType);
                      }}
                      className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors mx-auto"
                    >
                      <Edit2 className="w-4 h-4" />
                      Add Description
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const filteredCourses = courses.filter((course) => {
    const matchesGrade = gradeFilter
      ? course.grade_id?.toString() === gradeFilter
      : true;
    const matchesBoard = boardFilter ? course.board === boardFilter : true;
    return matchesGrade && matchesBoard;
  });

  // Main courses view
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Toaster position="top-right" />

      {/* Breadcrumb for root */}
      {location.pathname !== "/create-courses" && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => navigate("/create-courses")}
            className="hover:text-gray-900 transition-colors"
          >
            Create Courses
          </button>
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Courses</h1>
            <p className="text-sm text-gray-500">
              Design and publish your catalog for students.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 gap-2"
              onClick={() => setShowLoadCourses(true)}
            >
              <Download className="w-4 h-4" />
              Load from Admin
            </Button>
            <Button
              className="h-10 gap-2"
              onClick={() => setShowCreateCourseModal(true)}
            >
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Grade
              </span>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="h-10 w-44 rounded-md border border-gray-200 bg-white px-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All grades</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade} value={grade.toString()}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Board
              </span>
              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="h-10 w-56 rounded-md border border-gray-200 bg-white px-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All boards</option>
                {pakistanBoards.map((board) => (
                  <option key={board.value} value={board.value}>
                    {board.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-10 text-gray-600 hover:text-gray-900"
              onClick={() => {
                setGradeFilter("");
                setBoardFilter("");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading courses...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setCourseClickLoading(true);
                        setSelectedCourse(course);
                        navigate(`/create-courses/${course.id}`);
                        setCourseClickLoading(false);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {course.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {course.grade_id
                            ? `Grade ${course.grade_id}`
                            : "No grade set"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pakistanBoards.find((b) => b.value === course.board)
                          ?.label || course.board || "Board not set"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {courses.length === 0
                    ? "No courses yet"
                    : "No courses match these filters"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {courses.length === 0
                    ? "Get started by creating your first course"
                    : "Try adjusting the filters above to see more courses"}
                </p>
                {courses.length === 0 ? (
                  <Button
                    className="gap-2"
                    onClick={() => setShowCreateCourseModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Course
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setGradeFilter("");
                      setBoardFilter("");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 scroll-auto w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Course</h3>
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter course code (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={courseForm.grade_id}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, grade_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Grade</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <option key={grade} value={grade.toString()}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board
                </label>
                <select
                  value={courseForm.board}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, board: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Board</option>
                  {pakistanBoards.map((board) => (
                    <option key={board.value} value={board.value}>
                      {board.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createCourse}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 scroll-auto w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">
                Confirm Delete
              </h3>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this {deleteConfirmation.type}?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Courses Modal */}
      {showLoadCourses && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Load Courses from Admin Database
              </h3>
              <button
                onClick={() => setShowLoadCourses(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0">
              <LoadCourses
                onClose={() => setShowLoadCourses(false)}
                onSuccess={() => {
                  loadCourses();
                  setShowLoadCourses(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourses;

/* 
SUPABASE SCHEMA:

-- Courses table
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  grade VARCHAR(10),
  board VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units table
CREATE TABLE units (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  main_description TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  unit_id BIGINT REFERENCES units(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  main_description TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtopics table (handles both subtopics and sub-subtopics)
CREATE TABLE subtopics (
  id BIGSERIAL PRIMARY KEY,
  topic_id BIGINT REFERENCES topics(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES subtopics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  main_description TEXT DEFAULT '',
  type VARCHAR(20) DEFAULT 'subtopic', -- 'subtopic' or 'sub-subtopic'
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_units_course_id ON units(course_id);
CREATE INDEX idx_topics_unit_id ON topics(unit_id);
CREATE INDEX idx_subtopics_topic_id ON subtopics(topic_id);
CREATE INDEX idx_subtopics_parent_id ON subtopics(parent_id);

-- Row Level Security (RLS) policies - adjust based on your auth requirements
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for owners only" ON courses FOR UPDATE USING (auth.uid() = user_id); -- Add user_id column if needed
CREATE POLICY "Enable delete for owners only" ON courses FOR DELETE USING (auth.uid() = user_id); -- Add user_id column if needed

-- Apply similar policies to other tables

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtopics_updated_at BEFORE UPDATE ON subtopics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example Supabase Edge Function call (commented in component):
-- supabase functions invoke create-description --data '{"type":"unit","title":"Algebra","short_description":"Basic algebraic concepts","grade":"10","subject":"Mathematics"}'

INTEGRATION NOTES:

1. Replace the mock supabase object with actual Supabase client:
   import { createClient } from '@supabase/supabase-js'
   const supabase = createClient('your-project-url', 'your-anon-key')

2. Update all database operations to use real Supabase calls:
   - loadCourses: supabase.from('courses').select('*').order('created_at', { ascending: false })
   - loadCourseStructure: Multiple calls to fetch units, topics, and subtopics
   - CRUD operations: Use proper insert, update, delete methods

3. Add proper error handling and loading states

4. Implement authentication and user-specific data filtering

5. The AI description generation edge function should be created separately:
   supabase functions new create-description

6. Add proper form validation and data sanitization

7. Consider adding drag-and-drop for reordering items by updating order_index

8. Add search and filtering capabilities for courses

9. Implement proper state management (Consider using Zustand or Redux for complex state)

10. Add proper TypeScript types for better development experience
*/
