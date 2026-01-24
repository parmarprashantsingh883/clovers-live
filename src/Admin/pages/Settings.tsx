import Header from "../components/Header";


const Settings = () => {
  return (
    <div>
      <Header title="Settings" subtitle="Manage your account settings" />

      <div className="p-6 space-y-6 max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Profile Settings</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
                <input
                  id="firstName"
                  defaultValue="Admin"
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
                <input
                  id="lastName"
                  defaultValue="User"
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <input
                id="email"
                type="email"
                defaultValue="admin@clovers.com"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium text-foreground">Company Name</label>
              <input
                id="company"
                defaultValue="Clovers"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Change Password</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
