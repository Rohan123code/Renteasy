export const CATEGORIES = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliance', label: 'Appliances' },
]

export const SUBCATEGORIES = {
  furniture: [
    { value: 'bed', label: 'Beds & Mattresses' },
    { value: 'sofa', label: 'Sofas & Chairs' },
    { value: 'table', label: 'Tables & Desks' },
    { value: 'wardrobe', label: 'Wardrobes & Storage' },
    { value: 'dining', label: 'Dining Sets' },
  ],
  appliance: [
    { value: 'fridge', label: 'Refrigerators' },
    { value: 'washing-machine', label: 'Washing Machines' },
    { value: 'tv', label: 'Televisions' },
    { value: 'ac', label: 'Air Conditioners' },
    { value: 'microwave', label: 'Microwaves' },
  ],
}

export const TENURE_OPTIONS = [3, 6, 12]

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  delivered: { label: 'Delivered', color: 'green' },
  active: { label: 'Active', color: 'green' },
  completed: { label: 'Completed', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
}

export const MAINTENANCE_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
]