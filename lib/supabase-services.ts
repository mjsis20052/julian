/**
 * Servicios para interactuar con Supabase
 * Funciones helpers para todas las operaciones CRUD
 */

import { supabase } from './supabase';
import { User, AttendanceRecord, Grade, NewsItem, PrivateMessage, Notification, ForumThread, ForumReply, Planificacion, Material, DailyTask, MaintenanceHistoryItem, Installation, Incident, StudentRepEvent, StudentRepForumThread, StudentRepForumReply, StudentRepAnnouncement, StudentRepClaim, CalendarEvent } from '../types';

// ============================================
// USUARIOS
// ============================================

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('id');
  
  if (error) throw error;
  
  return data.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role as any,
    careerId: u.career_id || undefined,
    year: u.year || undefined,
    assignedSubjects: u.assigned_subjects || undefined
  }));
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      career_id: user.careerId || null,
      year: user.year || null,
      assigned_subjects: user.assignedSubjects || null
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role as any,
    careerId: data.career_id || undefined,
    year: data.year || undefined,
    assignedSubjects: data.assigned_subjects || undefined
  };
}

// ============================================
// ASISTENCIA
// ============================================

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map(r => ({
    id: r.id,
    studentId: r.student_id,
    subjectId: r.subject_id,
    date: r.date,
    status: r.status as any,
    justificationReason: r.justification_reason || undefined,
    justificationFile: r.justification_file_name ? {
      name: r.justification_file_name,
      type: r.justification_file_type,
      content: r.justification_file_content
    } : undefined
  }));
}

export async function createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      id: `att-${record.studentId}-${record.subjectId}-${record.date}`,
      student_id: record.studentId,
      subject_id: record.subjectId,
      date: record.date,
      status: record.status,
      justification_reason: record.justificationReason || null,
      justification_file_name: record.justificationFile?.name || null,
      justification_file_type: record.justificationFile?.type || null,
      justification_file_content: record.justificationFile?.content || null
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    studentId: data.student_id,
    subjectId: data.subject_id,
    date: data.date,
    status: data.status as any,
    justificationReason: data.justification_reason || undefined,
    justificationFile: data.justification_file_name ? {
      name: data.justification_file_name,
      type: data.justification_file_type,
      content: data.justification_file_content
    } : undefined
  };
}

export async function updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
  const { error } = await supabase
    .from('attendance_records')
    .update({
      status: updates.status,
      justification_reason: updates.justificationReason || null,
      justification_file_name: updates.justificationFile?.name || null,
      justification_file_type: updates.justificationFile?.type || null,
      justification_file_content: updates.justificationFile?.content || null
    })
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// CALIFICACIONES
// ============================================

export async function getGrades(): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(g => ({
    id: g.id,
    studentId: g.student_id,
    subjectId: g.subject_id,
    type: g.type as any,
    value: g.value,
    comments: g.comments || undefined
  }));
}

export async function upsertGrades(grades: Grade[]): Promise<void> {
  const gradesToInsert = grades.map(g => ({
    id: g.id,
    student_id: g.studentId,
    subject_id: g.subjectId,
    type: g.type,
    value: g.value,
    comments: g.comments || null
  }));
  
  const { error } = await supabase
    .from('grades')
    .upsert(gradesToInsert, { onConflict: 'id' });
  
  if (error) throw error;
}

// ============================================
// NOTIFICACIONES
// ============================================

export async function getNotifications(userId: number): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(n => ({
    id: n.id,
    userId: n.user_id,
    type: n.type as any,
    text: n.text,
    details: n.details || undefined,
    timestamp: n.created_at,
    read: n.read
  }));
}

export async function createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      id: `notif-${Date.now()}-${notification.userId}`,
      user_id: notification.userId,
      type: notification.type,
      text: notification.text,
      details: notification.details || null,
      read: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type as any,
    text: data.text,
    details: data.details || undefined,
    timestamp: data.created_at,
    read: data.read
  };
}

export async function markNotificationsAsRead(userId: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) throw error;
}

// ============================================
// MENSAJES PRIVADOS
// ============================================

export async function getPrivateMessages(userId?: number): Promise<PrivateMessage[]> {
  let query = supabase
    .from('private_messages')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (userId) {
    query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data.map(m => ({
    id: m.id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    text: m.text,
    timestamp: m.created_at,
    read: m.read
  }));
}

export async function createPrivateMessage(message: Omit<PrivateMessage, 'id' | 'timestamp' | 'read'>): Promise<PrivateMessage> {
  const { data, error } = await supabase
    .from('private_messages')
    .insert({
      id: `msg-${Date.now()}`,
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      text: message.text,
      read: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    text: data.text,
    timestamp: data.created_at,
    read: data.read
  };
}

export async function markMessagesAsRead(readerId: number, senderId: number): Promise<void> {
  const { error } = await supabase
    .from('private_messages')
    .update({ read: true })
    .eq('receiver_id', readerId)
    .eq('sender_id', senderId)
    .eq('read', false);
  
  if (error) throw error;
}

// ============================================
// COMUNICADOS
// ============================================

export async function getNewsItems(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(n => ({
    id: n.id,
    text: n.text,
    careerId: n.career_id || undefined,
    year: n.year || undefined,
    subjectId: n.subject_id || undefined
  }));
}

export async function createNewsItem(item: Omit<NewsItem, 'id'>): Promise<NewsItem> {
  const { data, error } = await supabase
    .from('news_items')
    .insert({
      id: `news-${Date.now()}`,
      text: item.text,
      career_id: item.careerId || null,
      year: item.year || null,
      subject_id: item.subjectId || null
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    text: data.text,
    careerId: data.career_id || undefined,
    year: data.year || undefined,
    subjectId: data.subject_id || undefined
  };
}

export async function deleteNewsItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('news_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// FOROS
// ============================================

export async function getForumThreads(): Promise<ForumThread[]> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(t => ({
    id: t.id,
    authorId: t.author_id,
    title: t.title,
    content: t.content,
    timestamp: t.timestamp,
    status: t.status as any,
    careerId: t.career_id,
    year: t.year,
    rejectionReason: t.rejection_reason || undefined,
    isLocked: t.is_locked || false
  }));
}

export async function createForumThread(thread: Omit<ForumThread, 'id' | 'timestamp' | 'status'>): Promise<ForumThread> {
  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      id: `thread-${Date.now()}`,
      author_id: thread.authorId,
      title: thread.title,
      content: thread.content,
      timestamp: new Date().toISOString(),
      status: 'Pendiente',
      career_id: thread.careerId,
      year: thread.year,
      is_locked: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    authorId: data.author_id,
    title: data.title,
    content: data.content,
    timestamp: data.timestamp,
    status: data.status as any,
    careerId: data.career_id,
    year: data.year,
    rejectionReason: data.rejection_reason || undefined,
    isLocked: data.is_locked || false
  };
}

export async function updateForumThread(id: string, updates: Partial<ForumThread>): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .update({
      title: updates.title,
      content: updates.content,
      status: updates.status,
      rejection_reason: updates.rejectionReason || null,
      is_locked: updates.isLocked
    })
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteForumThread(id: string): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getForumReplies(): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from('forum_replies')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return data.map(r => ({
    id: r.id,
    threadId: r.thread_id,
    authorId: r.author_id,
    content: r.content,
    timestamp: r.timestamp
  }));
}

export async function createForumReply(reply: Omit<ForumReply, 'id' | 'timestamp'>): Promise<ForumReply> {
  const { data, error } = await supabase
    .from('forum_replies')
    .insert({
      id: `reply-${Date.now()}`,
      thread_id: reply.threadId,
      author_id: reply.authorId,
      content: reply.content,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    threadId: data.thread_id,
    authorId: data.author_id,
    content: data.content,
    timestamp: data.timestamp
  };
}

export async function deleteForumReply(id: string): Promise<void> {
  const { error } = await supabase
    .from('forum_replies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// EVENTOS
// ============================================

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) throw error;
  
  return data.map(e => ({
    id: e.id,
    date: e.date,
    startTime: e.start_time || undefined,
    endTime: e.end_time || undefined,
    title: e.title,
    type: e.type as any,
    description: e.description || undefined,
    subjectId: e.subject_id || undefined,
    isAllDay: e.is_all_day || false
  }));
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      id: `custom-${Date.now()}`,
      date: event.date,
      start_time: event.startTime || null,
      end_time: event.endTime || null,
      title: event.title,
      type: event.type,
      description: event.description || null,
      subject_id: event.subjectId || null,
      is_all_day: event.isAllDay || false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    date: data.date,
    startTime: data.start_time || undefined,
    endTime: data.end_time || undefined,
    title: data.title,
    type: data.type as any,
    description: data.description || undefined,
    subjectId: data.subject_id || undefined,
    isAllDay: data.is_all_day || false
  };
}

// ============================================
// EVENTOS DEL CENTRO DE ESTUDIANTES
// ============================================

export async function getStudentRepEvents(): Promise<StudentRepEvent[]> {
  const { data, error } = await supabase
    .from('student_rep_events')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) throw error;
  
  return data.map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time || undefined,
    location: e.location || undefined,
    description: e.description,
    type: e.type as any,
    organizer: e.organizer
  }));
}

export async function createStudentRepEvent(event: Omit<StudentRepEvent, 'id'>): Promise<StudentRepEvent> {
  const { data, error } = await supabase
    .from('student_rep_events')
    .insert({
      id: `sre-${Date.now()}`,
      title: event.title,
      date: event.date,
      time: event.time || null,
      location: event.location || null,
      description: event.description,
      type: event.type,
      organizer: event.organizer
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    time: data.time || undefined,
    location: data.location || undefined,
    description: data.description,
    type: data.type as any,
    organizer: data.organizer
  };
}

export async function updateStudentRepEvent(id: string, updates: Partial<StudentRepEvent>): Promise<void> {
  const { error } = await supabase
    .from('student_rep_events')
    .update({
      title: updates.title,
      date: updates.date,
      time: updates.time || null,
      location: updates.location || null,
      description: updates.description,
      type: updates.type,
      organizer: updates.organizer
    })
    .eq('id', id);
  
  if (error) throw error;
}

export async function getEventParticipants(eventId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('event_participants')
    .select('user_id')
    .eq('event_id', eventId);
  
  if (error) throw error;
  
  return data.map(p => p.user_id);
}

export async function joinEvent(eventId: string, userId: number): Promise<void> {
  const { error } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      user_id: userId
    });
  
  if (error && error.code !== '23505') throw error; // Ignore duplicate key error
}

// Funciones similares para otras entidades...
// Por ahora, agregaré las más importantes y el resto se puede agregar según necesidad

