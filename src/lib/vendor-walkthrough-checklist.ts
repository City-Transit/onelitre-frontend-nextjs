/** Mirrors the backend's draft checklist (`vendor-walkthrough-checklist.ts`) — keep in sync. */
export const WALKTHROUGH_CHECKLIST_ITEMS = [
  { key: 'clean_prep_surfaces', label: 'Prep surfaces and equipment are visibly clean' },
  {
    key: 'handwashing_station',
    label: 'A handwashing station with soap and water is present and in use',
  },
  {
    key: 'safe_food_storage',
    label: 'Raw and cooked food are stored separately, with no visible spoilage',
  },
  { key: 'pest_control', label: 'No visible signs of pests' },
  { key: 'waste_disposal', label: 'Waste is covered and kept away from food prep areas' },
  { key: 'safe_water_source', label: 'Kitchen uses a safe, consistent water source' },
] as const;
