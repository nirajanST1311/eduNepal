import { apiSlice } from "./apiSlice";

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    markAttendance: build.mutation({
      query: (body) => ({ url: "/attendance", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendance: build.query({
      query: (params) => ({ url: "/attendance", params }),
      transformResponse: (res) => (Array.isArray(res) ? (res[0] ?? null) : res),
      providesTags: ["Attendance"],
    }),
    getStudentAttendance: build.query({
      query: ({ studentId, ...params }) => ({
        url: `/attendance/student/${studentId}`,
        params,
      }),
      providesTags: ["Attendance"],
    }),
    getMyAttendance: build.query({
      query: (params) => ({ url: "/attendance/me", params }),
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetAttendanceQuery,
  useGetStudentAttendanceQuery,
  useGetMyAttendanceQuery,
} = attendanceApi;
