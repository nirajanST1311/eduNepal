import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LandingPage from "@/pages/public/LandingPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import ChangePassword from "@/pages/profile/ChangePassword";
// Teacher
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherContent from "@/pages/teacher/TeacherContent";
import AddChapter from "@/pages/teacher/AddChapter";
import EditChapter from "@/pages/teacher/EditChapter";
import ChapterDetail from "@/pages/teacher/ChapterDetail";
import TeacherAssignments from "@/pages/teacher/TeacherAssignments";
import AssignmentDetail from "@/pages/teacher/AssignmentDetail";
import CreateAssignment from "@/pages/teacher/CreateAssignment";
import EditAssignment from "@/pages/teacher/EditAssignment";
import GradeAssignment from "@/pages/teacher/GradeAssignment";
import TeacherAttendance from "@/pages/teacher/TeacherAttendance";
import TeacherStudents from "@/pages/teacher/TeacherStudents";
import TeacherStudentDetail from "@/pages/teacher/TeacherStudentDetail";
import TeacherNotices from "@/pages/teacher/TeacherNotices";
// Student
import StudentHome from "@/pages/student/StudentHome";
import MySubjects from "@/pages/student/MySubjects";
import SubjectDetail from "@/pages/student/SubjectDetail";
import TopicViewer from "@/pages/student/TopicViewer";
import StudentAssignments from "@/pages/student/StudentAssignments";
import StudentAttendance from "@/pages/student/StudentAttendance";
import StudentNotices from "@/pages/student/StudentNotices";
// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminClasses from "@/pages/admin/AdminClasses";
import AdminSubjects from "@/pages/admin/AdminSubjects";
import AdminNotices from "@/pages/admin/AdminNotices";
// Super Admin
import SuperadminDashboard from "@/pages/superadmin/SuperadminDashboard";
import SchoolList from "@/pages/superadmin/SchoolList";
import SchoolDetail from "@/pages/superadmin/SchoolDetail";
import SuperadminNotices from "@/pages/superadmin/SuperadminNotices";
import AddNotice from "@/pages/superadmin/AddNotice";
import SuperadminSettings from "@/pages/superadmin/SuperadminSettings";
import SuperadminPrincipals from "@/pages/superadmin/SuperadminPrincipals";

import AddSchool from "@/pages/superadmin/AddSchool";
import SuperadminAnalytics from "@/pages/superadmin/SuperadminAnalytics";

const roleHome = {
  TEACHER: "/teacher",
  STUDENT: "/student",
  SCHOOL_ADMIN: "/admin",
  SUPER_ADMIN: "/superadmin",
};

function App() {
  const { user } = useSelector((s) => s.auth);

  return (
    <ErrorBoundary fullPage>
    <Routes>
      {/* Public landing page */}
      <Route
        path="/"
        element={
          user && roleHome[user.role] ? (
            <Navigate to={roleHome[user.role]} replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          user && roleHome[user.role] ? (
            <Navigate to={roleHome[user.role]} replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Teacher */}
      <Route element={<ProtectedRoute roles={["TEACHER"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/content" element={<TeacherContent />} />
          <Route path="/teacher/content/add" element={<AddChapter />} />
          <Route
            path="/teacher/content/:chapterId"
            element={<ChapterDetail />}
          />
          <Route
            path="/teacher/content/:chapterId/edit"
            element={<EditChapter />}
          />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route
            path="/teacher/assignments/create"
            element={<CreateAssignment />}
          />
          <Route
            path="/teacher/assignments/:assignmentId"
            element={<AssignmentDetail />}
          />
          <Route
            path="/teacher/assignments/:assignmentId/edit"
            element={<EditAssignment />}
          />
          <Route
            path="/teacher/assignments/:assignmentId/grade"
            element={<GradeAssignment />}
          />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/notices" element={<TeacherNotices />} />
          <Route
            path="/teacher/students/:studentId"
            element={<TeacherStudentDetail />}
          />
          <Route path="/teacher/profile" element={<ProfilePage />} />
          <Route path="/teacher/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/student" element={<StudentHome />} />
          <Route path="/student/subjects" element={<MySubjects />} />
          <Route
            path="/student/subjects/:subjectId"
            element={<SubjectDetail />}
          />
          <Route
            path="/student/subjects/:subjectId/chapters/:chapterId/topics/:topicId"
            element={<TopicViewer />}
          />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/notices" element={<StudentNotices />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* School Admin */}
      <Route element={<ProtectedRoute roles={["SCHOOL_ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route path="/admin/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Super Admin */}
      <Route element={<ProtectedRoute roles={["SUPER_ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/superadmin" element={<SuperadminDashboard />} />
          <Route
            path="/superadmin/analytics"
            element={<SuperadminAnalytics />}
          />
          <Route path="/superadmin/schools" element={<SchoolList />} />
          <Route path="/superadmin/schools/add" element={<AddSchool />} />
          <Route
            path="/superadmin/schools/:schoolId"
            element={<SchoolDetail />}
          />
          <Route path="/superadmin/notices" element={<SuperadminNotices />} />
          <Route path="/superadmin/notices/create" element={<AddNotice />} />
          <Route
            path="/superadmin/principals"
            element={<SuperadminPrincipals />}
          />
          <Route path="/superadmin/settings" element={<SuperadminSettings />} />
          <Route path="/superadmin/profile" element={<ProfilePage />} />
          <Route
            path="/superadmin/change-password"
            element={<ChangePassword />}
          />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}

export default App;
