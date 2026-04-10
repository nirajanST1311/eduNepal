import { apiSlice } from "./apiSlice";

export const subjectApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getSubjects: build.query({
      query: (params) => ({ url: "/subjects", params }),
      providesTags: ["Subjects"],
    }),
    createSubject: build.mutation({
      query: (body) => ({ url: "/subjects", method: "POST", body }),
      invalidatesTags: ["Subjects"],
    }),
    updateSubject: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/subjects/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subjects"],
    }),
    deleteSubject: build.mutation({
      query: (id) => ({ url: `/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Subjects"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;
