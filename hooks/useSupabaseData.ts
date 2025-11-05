/**
 * Hook personalizado para gestionar datos de Supabase
 * Maneja carga inicial, actualizaciones y sincronización
 */

import { useState, useEffect, useCallback } from 'react';
import * as supabaseServices from '../lib/supabase-services';
import { User, AttendanceRecord, Grade, NewsItem, PrivateMessage, Notification, ForumThread, ForumReply, CalendarEvent, StudentRepEvent } from '../types';

export function useSupabaseData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para datos
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [forumReplies, setForumReplies] = useState<ForumReply[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [studentRepEvents, setStudentRepEvents] = useState<StudentRepEvent[]>([]);
  const [eventParticipants, setEventParticipants] = useState<Record<string, number[]>>({});

  // Cargar todos los datos iniciales
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        usersData,
        attendanceData,
        gradesData,
        newsData,
        messagesData,
        threadsData,
        repliesData,
        eventsData,
        studentRepEventsData
      ] = await Promise.all([
        supabaseServices.getUsers(),
        supabaseServices.getAttendanceRecords(),
        supabaseServices.getGrades(),
        supabaseServices.getNewsItems(),
        supabaseServices.getPrivateMessages(),
        supabaseServices.getForumThreads(),
        supabaseServices.getForumReplies(),
        supabaseServices.getCalendarEvents(),
        supabaseServices.getStudentRepEvents()
      ]);
      
      setUsers(usersData);
      setAttendanceRecords(attendanceData);
      setGrades(gradesData);
      setNewsItems(newsData);
      setPrivateMessages(messagesData);
      setForumThreads(threadsData);
      setForumReplies(repliesData);
      setCalendarEvents(eventsData);
      setStudentRepEvents(studentRepEventsData);
      
      // Cargar participantes de eventos
      const participantsMap: Record<string, number[]> = {};
      for (const event of studentRepEventsData) {
        try {
          const participants = await supabaseServices.getEventParticipants(event.id);
          participantsMap[event.id] = participants;
        } catch (err) {
          console.error(`Error loading participants for event ${event.id}:`, err);
        }
      }
      setEventParticipants(participantsMap);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar notificaciones para un usuario específico
  const loadNotifications = useCallback(async (userId: number) => {
    try {
      const data = await supabaseServices.getNotifications(userId);
      setNotifications(data);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Funciones de actualización
  const refreshUsers = useCallback(async () => {
    const data = await supabaseServices.getUsers();
    setUsers(data);
  }, []);

  const refreshAttendance = useCallback(async () => {
    const data = await supabaseServices.getAttendanceRecords();
    setAttendanceRecords(data);
  }, []);

  const refreshGrades = useCallback(async () => {
    const data = await supabaseServices.getGrades();
    setGrades(data);
  }, []);

  const refreshNews = useCallback(async () => {
    const data = await supabaseServices.getNewsItems();
    setNewsItems(data);
  }, []);

  const refreshMessages = useCallback(async () => {
    const data = await supabaseServices.getPrivateMessages();
    setPrivateMessages(data);
  }, []);

  const refreshForumThreads = useCallback(async () => {
    const data = await supabaseServices.getForumThreads();
    setForumThreads(data);
  }, []);

  const refreshForumReplies = useCallback(async () => {
    const data = await supabaseServices.getForumReplies();
    setForumReplies(data);
  }, []);

  const refreshCalendarEvents = useCallback(async () => {
    const data = await supabaseServices.getCalendarEvents();
    setCalendarEvents(data);
  }, []);

  const refreshStudentRepEvents = useCallback(async () => {
    const data = await supabaseServices.getStudentRepEvents();
    setStudentRepEvents(data);
  }, []);

  return {
    // Estados
    loading,
    error,
    users,
    attendanceRecords,
    grades,
    newsItems,
    privateMessages,
    notifications,
    forumThreads,
    forumReplies,
    calendarEvents,
    studentRepEvents,
    eventParticipants,
    
    // Setters (para actualizaciones optimistas)
    setUsers,
    setAttendanceRecords,
    setGrades,
    setNewsItems,
    setPrivateMessages,
    setNotifications,
    setForumThreads,
    setForumReplies,
    setCalendarEvents,
    setStudentRepEvents,
    setEventParticipants,
    
    // Funciones de carga
    loadAllData,
    loadNotifications,
    
    // Funciones de refresh
    refreshUsers,
    refreshAttendance,
    refreshGrades,
    refreshNews,
    refreshMessages,
    refreshForumThreads,
    refreshForumReplies,
    refreshCalendarEvents,
    refreshStudentRepEvents
  };
}

