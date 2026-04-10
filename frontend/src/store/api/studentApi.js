import { apiSlice } from "./apiSlice";

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getStudents: build.query({
      query: (params) => ({ url: "/students", params }),
      providesTags: ["Students"],
    }),
    getStudentOverview: build.query({
      query: (id) => `/students/${id}/overview`,
      providesTags: (r, e, id) => [{ type: "StudentOverview", id }],
    }),
    addStudentNote: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/students/${id}/notes`,
        method: "POST",
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: "StudentOverview", id }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentOverviewQuery,
  useAddStudentNoteMutation,
} = studentApi;
