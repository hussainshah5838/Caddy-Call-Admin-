import React from "react";
import SettingRow from "../Components/settings/SettingRow";
import { settingsItems } from "../Data/settings";

export default function SettingsPage() {
  // accordion: only one open at a time (or set to null when all closed)
  const [openId, setOpenId] = React.useState(null);

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage all users registered on the Golf Platform, including golfers
          and staff members.
        </p>
      </div>

      {/* Center column like screenshots */}
      <div className="max-w-2xl">
        <div className="space-y-3">
          {settingsItems.map((s) => (
            <SettingRow
              key={s.id}
              title={s.title}
              isOpen={openId === s.id}
              onToggle={() => toggle(s.id)}
            >
              {/* Render plain text; replace with rich content if needed */}
              <pre className="whitespace-pre-wrap">{s.content.trim()}</pre>
            </SettingRow>
          ))}
        </div>
      </div>
    </div>
  );
}
