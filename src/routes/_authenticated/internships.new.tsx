import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/internships/new")({
  beforeLoad: () => { throw redirect({ to: "/dashboard" }); },
  component: () => null,
});
