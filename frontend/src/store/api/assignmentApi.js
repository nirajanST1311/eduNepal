import { apiSlice } from "./apiSlice";

export const assignmentApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAssignments: build.query({
      query: (params) => ({ url: "/assignments", params }),
      providesTags: ["Assignments"],
    }),
    getAssignment: build.query({
      query: (id) => `/assignments/${id}`,
      providesTags: (r, e, id) => [{ type: "Assignments", id }],
    }),
    createAssignment: build.mutation({
      query: (body) => ({ url: "/assignments", method: "POST", body }),
      invalidatesTags: ["Assignments"],
    }),
    updateAssignment: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/assignments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Assignments"],
    }),
    getSubmissions: build.query({
      query: (assignmentId) => `/assignments/${assignmentId}/submissions`,
      providesTags: ["Submissions"],
    }),
    submitAssignment: build.mutation({
      query: ({ assignmentId, ...body }) => ({
        url: `/assignments/${assignmentId}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assignments", "Submissions"],
    }),
    gradeSubmission: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/assignments/submissions/${id}/grade`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Submissions", "Assignments"],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useGetSubmissionsQuery,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
} = assignmentApi;
