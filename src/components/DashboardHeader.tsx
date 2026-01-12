interface DashboardHeaderProps {
  studentName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ studentName = "Student Name" }) => {
  // Get initials from student name
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-[hsl(var(--card))] rounded-2xl shadow-[var(--shadow-card)] p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">BJOT</span>
            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-50 text-blue-bg rounded-full font-medium">
              Student
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[hsl(var(--border))] mx-2" />

        {/* Page Title */}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3">
        {/* Avatar with initials */}
        <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
          <span className="text-[hsl(var(--primary-foreground))] font-semibold text-sm">
            {getInitials(studentName)}
          </span>
        </div>
        <span className="font-medium text-[hsl(var(--foreground))]">{studentName}</span>
      </div>
    </header>
  );
};

export default DashboardHeader;