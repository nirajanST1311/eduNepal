import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "Schools",
    "Classes",
    "Subjects",
    "Chapters",
    "Topics",
    "Assignments",
    "Submissions",
    "Attendance",
    "Notices",
    "Students",
    "StudentOverview",
  ],
  endpoints: () => ({}),
});
