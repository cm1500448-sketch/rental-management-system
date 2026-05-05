export const UNIT_TYPES = [
  { value: 'single_room', label: 'Single Room' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'studio', label: 'Studio' },
  { value: '1_bedroom', label: '1 Bedroom' },
  { value: '2_bedroom', label: '2 Bedroom' },
  { value: '3_bedroom', label: '3 Bedroom' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'other', label: 'Other' },
];

export const getUnitTypeLabel = (value) => {
  if (!value) return null;
  return UNIT_TYPES.find((t) => t.value === value)?.label ?? value;
};

export const UNIT_TYPE_COLORS = {
  single_room: 'bg-gray-100 text-gray-700',
  bedsitter: 'bg-purple-100 text-purple-700',
  studio: 'bg-indigo-100 text-indigo-700',
  '1_bedroom': 'bg-blue-100 text-blue-700',
  '2_bedroom': 'bg-cyan-100 text-cyan-700',
  '3_bedroom': 'bg-teal-100 text-teal-700',
  penthouse: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
};
