import { WorkspaceShell } from "@/components/WorkspaceShell";

export default function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}

