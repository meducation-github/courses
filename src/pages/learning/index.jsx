import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle, Clock, FileText, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../hooks/useAuth";

const sampleLessons = [
  {
    id: "lsn-1",
    title: "Introduction to Photosynthesis",
    course: "Biology - Grade 9",
    date: "2025-11-21",
    duration: "45 min",
    status: "not_started",
    description: "Understand the basics of how plants make food using sunlight.",
    resources: [
      { id: "res-1", label: "Slides", url: "#" },
      { id: "res-2", label: "Reading", url: "#" },
    ],
  },
  {
    id: "lsn-2",
    title: "Algebraic Expressions",
    course: "Mathematics - Grade 9",
    date: "2025-11-23",
    duration: "40 min",
    status: "in_progress",
    description: "Simplifying and expanding algebraic expressions with practice problems.",
    resources: [{ id: "res-3", label: "Practice Sheet", url: "#" }],
  },
];

const sampleAssessments = [
  {
    id: "asm-1",
    title: "Photosynthesis Quiz",
    type: "Quiz",
    course: "Biology - Grade 9",
    dueDate: "2025-11-25",
    status: "not_started",
    description: "10 MCQs covering light and dark reactions.",
  },
  {
    id: "asm-2",
    title: "Algebra Assignment",
    type: "Assignment",
    course: "Mathematics - Grade 9",
    dueDate: "2025-11-27",
    status: "in_progress",
    description: "Upload worked solutions for the provided problems.",
  },
];

export default function LearningHub() {
  const { userRole, institute } = useAuth();
  const [activeTab, setActiveTab] = useState("lessons");
  const [lessons, setLessons] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");

  useEffect(() => {
    // TODO: Replace with Supabase queries filtered by student + institute.
    setLessons(sampleLessons);
    setAssessments(sampleAssessments);
  }, []);

  const lessonProgress = useMemo(() => {
    const total = lessons.length || 1;
    const completed = lessons.filter((l) => l.status === "completed").length;
    const inProgress = lessons.filter((l) => l.status === "in_progress").length;
    return {
      completed,
      inProgress,
      remaining: Math.max(total - (completed + inProgress), 0),
    };
  }, [lessons]);

  const assessmentProgress = useMemo(() => {
    const total = assessments.length || 1;
    const submitted = assessments.filter((a) => a.status === "submitted").length;
    const inProgress = assessments.filter((a) => a.status === "in_progress").length;
    return {
      submitted,
      inProgress,
      pending: Math.max(total - (submitted + inProgress), 0),
    };
  }, [assessments]);

  const updateLessonStatus = (lessonId, status) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, status } : lesson
      )
    );
  };

  const startAssessment = (assessmentId) => {
    setAssessments((prev) =>
      prev.map((assessment) =>
        assessment.id === assessmentId && assessment.status === "not_started"
          ? { ...assessment, status: "in_progress" }
          : assessment
      )
    );
    setActiveAssessmentId(assessmentId);
  };

  const submitAssessment = (assessmentId) => {
    setAssessments((prev) =>
      prev.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, status: "submitted", submittedAt: new Date().toISOString() }
          : assessment
      )
    );
    setActiveAssessmentId(null);
    setSubmissionNote("");
    setAttachedFileName("");
  };

  if (userRole !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">
          This space is available to students only.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {institute?.name ? `Institute · ${institute.name}` : "Student workspace"}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">Learning Hub</h1>
          <p className="text-sm text-gray-600">
            Access upcoming lessons and assessments, interact with resources, and submit work.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "lessons" ? "default" : "outline"}
            onClick={() => setActiveTab("lessons")}
          >
            Lessons
          </Button>
          <Button
            variant={activeTab === "assessments" ? "default" : "outline"}
            onClick={() => setActiveTab("assessments")}
          >
            Assessments
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Lessons
            </CardTitle>
            <CardDescription>Track what is assigned to you.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-800">
            <div className="flex items-center justify-between">
              <span>In progress</span>
              <span className="font-semibold">{lessonProgress.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="font-semibold">{lessonProgress.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining</span>
              <span className="font-semibold">{lessonProgress.remaining}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Assessments
            </CardTitle>
            <CardDescription>Assignments, quizzes, and projects.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-800">
            <div className="flex items-center justify-between">
              <span>In progress</span>
              <span className="font-semibold">{assessmentProgress.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Submitted</span>
              <span className="font-semibold">{assessmentProgress.submitted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending</span>
              <span className="font-semibold">{assessmentProgress.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              Upcoming
            </CardTitle>
            <CardDescription>Your next tasks at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-800 space-y-2">
            {lessons.slice(0, 1).map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-gray-500">{lesson.date}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  Lesson
                </span>
              </div>
            ))}
            {assessments.slice(0, 1).map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{assessment.title}</p>
                  <p className="text-xs text-gray-500">Due {assessment.dueDate}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  {assessment.type}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {activeTab === "lessons" ? (
        <Card>
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">My Lessons</CardTitle>
              <CardDescription>Review, download resources, and mark progress.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search lesson" className="h-10 w-48" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wide text-gray-500">
                      {lesson.course}
                    </p>
                    <h3 className="text-base font-semibold text-gray-900">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600">{lesson.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.duration}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {lesson.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.status !== "completed" && (
                      <Button
                        variant="outline"
                        onClick={() => updateLessonStatus(lesson.id, "completed")}
                      >
                        Mark done
                      </Button>
                    )}
                    {lesson.status === "not_started" && (
                      <Button onClick={() => updateLessonStatus(lesson.id, "in_progress")}>
                        Start
                      </Button>
                    )}
                    {lesson.status === "in_progress" && (
                      <Button onClick={() => updateLessonStatus(lesson.id, "completed")}>
                        Finish
                      </Button>
                    )}
                  </div>
                </div>

                {lesson.resources?.length ? (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {lesson.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
                      >
                        {res.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">My Assessments</CardTitle>
              <CardDescription>Start, continue, and submit your work.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessments.map((assessment) => {
              const isActive = activeAssessmentId === assessment.id;
              return (
                <div
                  key={assessment.id}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm uppercase tracking-wide text-gray-500">
                        {assessment.course}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600">{assessment.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Due {assessment.dueDate}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Status: {assessment.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assessment.status === "not_started" && (
                        <Button onClick={() => startAssessment(assessment.id)}>Start</Button>
                      )}
                      {assessment.status === "in_progress" && (
                        <Button onClick={() => setActiveAssessmentId(assessment.id)}>
                          Continue
                        </Button>
                      )}
                      {assessment.status === "submitted" && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                          Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`answer-${assessment.id}`}>Your answer</Label>
                        <textarea
                          id={`answer-${assessment.id}`}
                          value={submissionNote}
                          onChange={(e) => setSubmissionNote(e.target.value)}
                          className="w-full rounded-md border border-gray-200 bg-white p-2 text-sm focus:border-blue-500 focus:outline-none"
                          rows={3}
                          placeholder="Type your response here"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Attach file</Label>
                        <Input
                          type="file"
                          onChange={(e) => setAttachedFileName(e.target.files?.[0]?.name || "")}
                        />
                        {attachedFileName && (
                          <p className="text-xs text-gray-600">
                            Selected: {attachedFileName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setActiveAssessmentId(null)}>
                          Cancel
                        </Button>
                        <Button onClick={() => submitAssessment(assessment.id)}>Submit work</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
