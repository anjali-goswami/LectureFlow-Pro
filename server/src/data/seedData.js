export const initialPolicies = {
  id: 'policy-default',
  lunchBreakStart: '12:00',
  lunchBreakEnd: '13:00',
  lunchBreakEnforced: true,
  minTransitionMinutes: 15,
  maxConsecutiveHours: 3,
  buildingChangeBufferMinutes: 20
};

export const initialDepartments = [
  {
    id: 'dept-001',
    name: 'Computer Science',
    code: 'CS',
    description: 'Department of Computer Science and Software Engineering',
    building: 'Turing Hall'
  },
  {
    id: 'dept-002',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Department of Mathematics and Statistics',
    building: 'Euler Building'
  },
  {
    id: 'dept-003',
    name: 'Physics',
    code: 'PHYS',
    description: 'Department of Physics and Astronomy',
    building: 'Newton Science Center'
  },
  {
    id: 'dept-004',
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Department of Electrical & Computer Engineering',
    building: 'Tesla Complex'
  },
  {
    id: 'dept-005',
    name: 'Business Administration',
    code: 'BUS',
    description: 'School of Management & Business Studies',
    building: 'Commerce Tower'
  }
];

export const initialLectureHalls = [
  {
    id: 'hall-001',
    roomNumber: 'A101',
    location: 'Turing Hall, 1st Floor',
    capacity: 55,
    facilities: ['Projector', 'Whiteboard', 'Audio System', 'High-speed WiFi'],
    isAvailable: true
  },
  {
    id: 'hall-002',
    roomNumber: 'A102',
    location: 'Turing Hall, 1st Floor',
    capacity: 110,
    facilities: ['Projector', 'Whiteboard', 'Audio System', 'Computer Lab', 'Lecture Capture'],
    isAvailable: true
  },
  {
    id: 'hall-003',
    roomNumber: 'B201',
    location: 'Newton Science Center, 2nd Floor',
    capacity: 160,
    facilities: ['Projector', 'Whiteboard', 'Audio System', 'Dual Screens', 'Microphones'],
    isAvailable: true
  },
  {
    id: 'hall-004',
    roomNumber: 'B202',
    location: 'Newton Science Center, 2nd Floor',
    capacity: 85,
    facilities: ['Projector', 'Whiteboard', 'Sound System', 'AC'],
    isAvailable: true
  },
  {
    id: 'hall-005',
    roomNumber: 'C301',
    location: 'Tesla Complex, 3rd Floor (Auditorium)',
    capacity: 220,
    facilities: ['4K Projector', 'Stage Sound System', 'Video Conferencing', 'Recording Studio', 'AC'],
    isAvailable: true
  },
  {
    id: 'hall-006',
    roomNumber: 'C302',
    location: 'Tesla Complex, 3rd Floor',
    capacity: 65,
    facilities: ['Smart Board', 'Whiteboard', 'Air Conditioning', 'WiFi'],
    isAvailable: true
  },
  {
    id: 'hall-007',
    roomNumber: 'D105',
    location: 'Euler Building, Ground Floor',
    capacity: 45,
    facilities: ['Whiteboard', 'Projector', 'Document Camera'],
    isAvailable: true
  }
];

export const initialCourses = [
  {
    id: 'course-001',
    code: 'CS101',
    name: 'Intro to Computer Science',
    instructor: 'Prof. James Wilson',
    departmentId: 'dept-001',
    studentCount: 130,
    credits: 3
  },
  {
    id: 'course-002',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Sarah Johnson',
    departmentId: 'dept-001',
    studentCount: 85,
    credits: 4
  },
  {
    id: 'course-003',
    code: 'MATH101',
    name: 'Calculus I',
    instructor: 'Prof. Robert Davis',
    departmentId: 'dept-002',
    studentCount: 155,
    credits: 4
  },
  {
    id: 'course-004',
    code: 'PHYS101',
    name: 'Classical Mechanics',
    instructor: 'Dr. Michael Chen',
    departmentId: 'dept-003',
    studentCount: 95,
    credits: 4
  },
  {
    id: 'course-005',
    code: 'EE101',
    name: 'Circuit Analysis',
    instructor: 'Prof. Thomas Brown',
    departmentId: 'dept-004',
    studentCount: 60,
    credits: 3
  },
  {
    id: 'course-006',
    code: 'CS301',
    name: 'Database Architecture',
    instructor: 'Dr. Jennifer Lee',
    departmentId: 'dept-001',
    studentCount: 50,
    credits: 3
  },
  {
    id: 'course-007',
    code: 'MATH201',
    name: 'Linear Algebra',
    instructor: 'Dr. Lisa Wang',
    departmentId: 'dept-002',
    studentCount: 75,
    credits: 3
  },
  {
    id: 'course-008',
    code: 'BUS101',
    name: 'Principles of Management',
    instructor: 'Prof. Karen White',
    departmentId: 'dept-005',
    studentCount: 140,
    credits: 3
  },
  {
    id: 'course-009',
    code: 'CS401',
    name: 'Operating Systems',
    instructor: 'Dr. Sarah Johnson',
    departmentId: 'dept-001',
    studentCount: 65,
    credits: 4
  }
];

export const initialTimeSlots = [
  // Monday
  { id: 'slot-mon-1', day: 'Monday', startTime: '08:30', endTime: '09:45', isLunchSlot: false },
  { id: 'slot-mon-2', day: 'Monday', startTime: '10:00', endTime: '11:15', isLunchSlot: false },
  { id: 'slot-mon-3', day: 'Monday', startTime: '11:30', endTime: '12:45', isLunchSlot: true }, // overlaps lunch
  { id: 'slot-mon-4', day: 'Monday', startTime: '13:00', endTime: '14:15', isLunchSlot: false },
  { id: 'slot-mon-5', day: 'Monday', startTime: '14:30', endTime: '15:45', isLunchSlot: false },
  { id: 'slot-mon-6', day: 'Monday', startTime: '16:00', endTime: '17:15', isLunchSlot: false },

  // Tuesday
  { id: 'slot-tue-1', day: 'Tuesday', startTime: '08:30', endTime: '09:45', isLunchSlot: false },
  { id: 'slot-tue-2', day: 'Tuesday', startTime: '10:00', endTime: '11:15', isLunchSlot: false },
  { id: 'slot-tue-3', day: 'Tuesday', startTime: '11:30', endTime: '12:45', isLunchSlot: true },
  { id: 'slot-tue-4', day: 'Tuesday', startTime: '13:00', endTime: '14:15', isLunchSlot: false },
  { id: 'slot-tue-5', day: 'Tuesday', startTime: '14:30', endTime: '15:45', isLunchSlot: false },
  { id: 'slot-tue-6', day: 'Tuesday', startTime: '16:00', endTime: '17:15', isLunchSlot: false },

  // Wednesday
  { id: 'slot-wed-1', day: 'Wednesday', startTime: '08:30', endTime: '09:45', isLunchSlot: false },
  { id: 'slot-wed-2', day: 'Wednesday', startTime: '10:00', endTime: '11:15', isLunchSlot: false },
  { id: 'slot-wed-3', day: 'Wednesday', startTime: '11:30', endTime: '12:45', isLunchSlot: true },
  { id: 'slot-wed-4', day: 'Wednesday', startTime: '13:00', endTime: '14:15', isLunchSlot: false },
  { id: 'slot-wed-5', day: 'Wednesday', startTime: '14:30', endTime: '15:45', isLunchSlot: false },
  { id: 'slot-wed-6', day: 'Wednesday', startTime: '16:00', endTime: '17:15', isLunchSlot: false },

  // Thursday
  { id: 'slot-thu-1', day: 'Thursday', startTime: '08:30', endTime: '09:45', isLunchSlot: false },
  { id: 'slot-thu-2', day: 'Thursday', startTime: '10:00', endTime: '11:15', isLunchSlot: false },
  { id: 'slot-thu-3', day: 'Thursday', startTime: '11:30', endTime: '12:45', isLunchSlot: true },
  { id: 'slot-thu-4', day: 'Thursday', startTime: '13:00', endTime: '14:15', isLunchSlot: false },
  { id: 'slot-thu-5', day: 'Thursday', startTime: '14:30', endTime: '15:45', isLunchSlot: false },
  { id: 'slot-thu-6', day: 'Thursday', startTime: '16:00', endTime: '17:15', isLunchSlot: false },

  // Friday
  { id: 'slot-fri-1', day: 'Friday', startTime: '08:30', endTime: '09:45', isLunchSlot: false },
  { id: 'slot-fri-2', day: 'Friday', startTime: '10:00', endTime: '11:15', isLunchSlot: false },
  { id: 'slot-fri-3', day: 'Friday', startTime: '11:30', endTime: '12:45', isLunchSlot: true },
  { id: 'slot-fri-4', day: 'Friday', startTime: '13:00', endTime: '14:15', isLunchSlot: false },
  { id: 'slot-fri-5', day: 'Friday', startTime: '14:30', endTime: '15:45', isLunchSlot: false },
  { id: 'slot-fri-6', day: 'Friday', startTime: '16:00', endTime: '17:15', isLunchSlot: false }
];

export const initialSchedules = [
  {
    id: 'sch-001',
    courseId: 'course-001',
    lectureHallId: 'hall-003', // 160 capacity for 130 students
    timeSlotId: 'slot-mon-1',
    day: 'Monday',
    startTime: '08:30',
    endTime: '09:45'
  },
  {
    id: 'sch-002',
    courseId: 'course-002',
    lectureHallId: 'hall-004', // 85 capacity for 85 students
    timeSlotId: 'slot-mon-2',
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:15'
  },
  {
    id: 'sch-003',
    courseId: 'course-003',
    lectureHallId: 'hall-005', // 220 capacity for 155 students
    timeSlotId: 'slot-mon-4',
    day: 'Monday',
    startTime: '13:00',
    endTime: '14:15'
  },
  {
    id: 'sch-004',
    courseId: 'course-004',
    lectureHallId: 'hall-002', // 110 cap for 95 students
    timeSlotId: 'slot-tue-2',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '11:15'
  },
  {
    id: 'sch-005',
    courseId: 'course-005',
    lectureHallId: 'hall-006', // 65 cap for 60 students
    timeSlotId: 'slot-tue-4',
    day: 'Tuesday',
    startTime: '13:00',
    endTime: '14:15'
  },
  // Intentionally included scenario that showcases the Lunch Break problem & Resolution
  {
    id: 'sch-006',
    courseId: 'course-006',
    lectureHallId: 'hall-001',
    timeSlotId: 'slot-mon-3', // 11:30 - 12:45 overlaps with 12:00-13:00 lunch break!
    day: 'Monday',
    startTime: '11:30',
    endTime: '12:45'
  }
];

export const initialUsers = [
  {
    id: 'user-001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@university.edu'
  },
  {
    id: 'user-002',
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'Academic Coordinator',
    email: 'staff@university.edu'
  }
];
