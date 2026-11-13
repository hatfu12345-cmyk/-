
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building, ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface Classroom {
  id: string;
  number: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floor: number;
  building: 'A' | 'B' | 'C';
}

interface FloorPlan {
  id: number;
  name: string;
  width: number;
  height: number;
  classrooms: Classroom[];
}

interface Building {
  id: string;
  name: string;
  floors: FloorPlan[];
}

const MapPage: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<'A' | 'B' | 'C'>('A');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedClassroom, setHighlightedClassroom] = useState<Classroom | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  // Создаем SVG-схемы для каждого этажа
  const floorPlansRef = useRef<{[key: string]: JSX.Element}>({});

  useEffect(() => {
    // Инициализация данных о корпусах и аудиториях
    const initializeBuildings = () => {
      const buildingsData: Building[] = [
        {
          id: 'A',
          name: 'Главный корпус (А)',
          floors: [
            {
              id: 1,
              name: '1 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'a101', number: '101', name: 'Приемная комиссия', x: 100, y: 100, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a102', number: '102', name: 'Деканат', x: 250, y: 100, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a103', number: '103', name: 'Бухгалтерия', x: 400, y: 100, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a104', number: '104', name: 'Актовый зал', x: 550, y: 100, width: 180, height: 150, floor: 1, building: 'A' },
                { id: 'a105', number: '105', name: 'Кабинет ректора', x: 100, y: 250, width: 150, height: 100, floor: 1, building: 'A' },
                { id: 'a106', number: '106', name: 'Переговорная', x: 280, y: 250, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a107', number: '107', name: 'Секретариат', x: 430, y: 250, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a108', number: '108', name: 'Кабинет №1', x: 580, y: 300, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a109', number: '109', name: 'Кабинет №2', x: 100, y: 380, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a110', number: '110', name: 'Кабинет №3', x: 250, y: 380, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a111', number: '111', name: 'Кабинет №4', x: 400, y: 380, width: 120, height: 80, floor: 1, building: 'A' },
                { id: 'a112', number: '112', name: 'Кабинет №5', x: 550, y: 430, width: 120, height: 80, floor: 1, building: 'A' },
              ]
            },
            {
              id: 2,
              name: '2 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'a201', number: '201', name: 'Лекционная аудитория', x: 100, y: 100, width: 180, height: 120, floor: 2, building: 'A' },
                { id: 'a202', number: '202', name: 'Лекционная аудитория', x: 310, y: 100, width: 180, height: 120, floor: 2, building: 'A' },
                { id: 'a203', number: '203', name: 'Лекционная аудитория', x: 520, y: 100, width: 180, height: 120, floor: 2, building: 'A' },
                { id: 'a204', number: '204', name: 'Переговорная', x: 100, y: 250, width: 120, height: 80, floor: 2, building: 'A' },
                { id: 'a205', number: '205', name: 'Лаборатория №1', x: 250, y: 250, width: 150, height: 100, floor: 2, building: 'A' },
                { id: 'a206', number: '206', name: 'Лаборатория №2', x: 430, y: 250, width: 150, height: 100, floor: 2, building: 'A' },
                { id: 'a207', number: '207', name: 'Кабинет преподавателя', x: 610, y: 250, width: 120, height: 80, floor: 2, building: 'A' },
                { id: 'a208', number: '208', name: 'Кабинет преподавателя', x: 100, y: 380, width: 120, height: 80, floor: 2, building: 'A' },
                { id: 'a209', number: '209', name: 'Кабинет преподавателя', x: 250, y: 380, width: 120, height: 80, floor: 2, building: 'A' },
                { id: 'a210', number: '210', name: 'Кабинет преподавателя', x: 400, y: 380, width: 120, height: 80, floor: 2, building: 'A' },
                { id: 'a211', number: '211', name: 'Кабинет преподавателя', x: 550, y: 380, width: 120, height: 80, floor: 2, building: 'A' },
              ]
            },
            {
              id: 3,
              name: '3 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'a301', number: '301', name: 'Лекционная аудитория', x: 100, y: 100, width: 180, height: 120, floor: 3, building: 'A' },
                { id: 'a302', number: '302', name: 'Лекционная аудитория', x: 310, y: 100, width: 180, height: 120, floor: 3, building: 'A' },
                { id: 'a303', number: '303', name: 'Лекционная аудитория', x: 520, y: 100, width: 180, height: 120, floor: 3, building: 'A' },
                { id: 'a304', number: '304', name: 'Лаборатория №3', x: 100, y: 250, width: 150, height: 100, floor: 3, building: 'A' },
                { id: 'a305', number: '305', name: 'Лаборатория №4', x: 280, y: 250, width: 150, height: 100, floor: 3, building: 'A' },
                { id: 'a306', number: '306', name: 'Лаборатория №5', x: 460, y: 250, width: 150, height: 100, floor: 3, building: 'A' },
                { id: 'a307', number: '307', name: 'Кабинет преподавателя', x: 640, y: 250, width: 120, height: 80, floor: 3, building: 'A' },
                { id: 'a308', number: '308', name: 'Кабинет преподавателя', x: 100, y: 380, width: 120, height: 80, floor: 3, building: 'A' },
                { id: 'a309', number: '309', name: 'Кабинет преподавателя', x: 250, y: 380, width: 120, height: 80, floor: 3, building: 'A' },
                { id: 'a310', number: '310', name: 'Кабинет преподавателя', x: 400, y: 380, width: 120, height: 80, floor: 3, building: 'A' },
                { id: 'a311', number: '311', name: 'Кабинет преподавателя', x: 550, y: 380, width: 120, height: 80, floor: 3, building: 'A' },
                { id: 'a312', number: '312', name: 'Кабинет преподавателя', x: 700, y: 380, width: 120, height: 80, floor: 3, building: 'A' },
              ]
            },
            {
              id: 4,
              name: '4 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'a401', number: '401', name: 'Лекционная аудитория', x: 100, y: 100, width: 180, height: 120, floor: 4, building: 'A' },
                { id: 'a402', number: '402', name: 'Лекционная аудитория', x: 310, y: 100, width: 180, height: 120, floor: 4, building: 'A' },
                { id: 'a403', number: '403', name: 'Лекционная аудитория', x: 520, y: 100, width: 180, height: 120, floor: 4, building: 'A' },
                { id: 'a404', number: '404', name: 'Лаборатория №6', x: 100, y: 250, width: 150, height: 100, floor: 4, building: 'A' },
                { id: 'a405', number: '405', name: 'Лаборатория №7', x: 280, y: 250, width: 150, height: 100, floor: 4, building: 'A' },
                { id: 'a406', number: '406', name: 'Лаборатория №8', x: 460, y: 250, width: 150, height: 100, floor: 4, building: 'A' },
                { id: 'a407', number: '407', name: 'Лаборатория №9', x: 640, y: 250, width: 120, height: 80, floor: 4, building: 'A' },
                { id: 'a408', number: '408', name: 'Лаборатория №10', x: 100, y: 380, width: 120, height: 80, floor: 4, building: 'A' },
                { id: 'a409', number: '409', name: 'Кабинет преподавателя', x: 250, y: 380, width: 120, height: 80, floor: 4, building: 'A' },
                { id: 'a410', number: '410', name: 'Кабинет преподавателя', x: 400, y: 380, width: 120, height: 80, floor: 4, building: 'A' },
                { id: 'a411', number: '411', name: 'Кабинет преподавателя', x: 550, y: 380, width: 120, height: 80, floor: 4, building: 'A' },
              ]
            }
          ]
        },
        {
          id: 'B',
          name: 'Лабораторный корпус (Б)',
          floors: [
            {
              id: 1,
              name: '1 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'b101', number: 'Б-101', name: 'Лаборатория кибербезопасности', x: 100, y: 100, width: 150, height: 100, floor: 1, building: 'B' },
                { id: 'b102', number: 'Б-102', name: 'Лаборатория сетей', x: 280, y: 100, width: 150, height: 100, floor: 1, building: 'B' },
                { id: 'b103', number: 'Б-103', name: 'Лаборатория баз данных', x: 460, y: 100, width: 150, height: 100, floor: 1, building: 'B' },
                { id: 'b104', number: 'Б-104', name: 'Лаборатория ИИ', x: 640, y: 100, width: 150, height: 100, floor: 1, building: 'B' },
                { id: 'b105', number: 'Б-105', name: 'Серверная', x: 100, y: 250, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b106', number: 'Б-106', name: 'Кабинет администратора', x: 250, y: 250, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b107', number: 'Б-107', name: 'Переговорная', x: 400, y: 250, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b108', number: 'Б-108', name: 'Кабинет №1', x: 550, y: 250, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b109', number: 'Б-109', name: 'Кабинет №2', x: 700, y: 250, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b110', number: 'Б-110', name: 'Кабинет №3', x: 100, y: 380, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b111', number: 'Б-111', name: 'Кабинет №4', x: 250, y: 380, width: 120, height: 80, floor: 1, building: 'B' },
                { id: 'b112', number: 'Б-112', name: 'Кабинет №5', x: 400, y: 380, width: 120, height: 80, floor: 1, building: 'B' },
              ]
            },
            {
              id: 2,
              name: '2 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'b201', number: 'Б-201', name: 'Лаборатория кибербезопасности', x: 100, y: 100, width: 150, height: 100, floor: 2, building: 'B' },
                { id: 'b202', number: 'Б-202', name: 'Лаборатория сетей', x: 280, y: 100, width: 150, height: 100, floor: 2, building: 'B' },
                { id: 'b203', number: 'Б-203', name: 'Лаборатория баз данных', x: 460, y: 100, width: 150, height: 100, floor: 2, building: 'B' },
                { id: 'b204', number: 'Б-204', name: 'Лаборатория ИИ', x: 640, y: 100, width: 150, height: 100, floor: 2, building: 'B' },
                { id: 'b205', number: 'Б-205', name: 'Серверная', x: 100, y: 250, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b206', number: 'Б-206', name: 'Кабинет администратора', x: 250, y: 250, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b207', number: 'Б-207', name: 'Переговорная', x: 400, y: 250, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b208', number: 'Б-208', name: 'Кабинет №1', x: 550, y: 250, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b209', number: 'Б-209', name: 'Кабинет №2', x: 700, y: 250, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b210', number: 'Б-210', name: 'Кабинет №3', x: 100, y: 380, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b211', number: 'Б-211', name: 'Кабинет №4', x: 250, y: 380, width: 120, height: 80, floor: 2, building: 'B' },
                { id: 'b212', number: 'Б-212', name: 'Кабинет №5', x: 400, y: 380, width: 120, height: 80, floor: 2, building: 'B' },
              ]
            },
            {
              id: 3,
              name: '3 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'b301', number: 'Б-301', name: 'Лаборатория кибербезопасности', x: 100, y: 100, width: 150, height: 100, floor: 3, building: 'B' },
                { id: 'b302', number: 'Б-302', name: 'Лаборатория сетей', x: 280, y: 100, width: 150, height: 100, floor: 3, building: 'B' },
                { id: 'b303', number: 'Б-303', name: 'Лаборатория баз данных', x: 460, y: 100, width: 150, height: 100, floor: 3, building: 'B' },
                { id: 'b304', number: 'Б-304', name: 'Лаборатория ИИ', x: 640, y: 100, width: 150, height: 100, floor: 3, building: 'B' },
                { id: 'b305', number: 'Б-305', name: 'Серверная', x: 100, y: 250, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b306', number: 'Б-306', name: 'Кабинет администратора', x: 250, y: 250, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b307', number: 'Б-307', name: 'Переговорная', x: 400, y: 250, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b308', number: 'Б-308', name: 'Кабинет №1', x: 550, y: 250, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b309', number: 'Б-309', name: 'Кабинет №2', x: 700, y: 250, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b310', number: 'Б-310', name: 'Кабинет №3', x: 100, y: 380, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b311', number: 'Б-311', name: 'Кабинет №4', x: 250, y: 380, width: 120, height: 80, floor: 3, building: 'B' },
                { id: 'b312', number: 'Б-312', name: 'Кабинет №5', x: 400, y: 380, width: 120, height: 80, floor: 3, building: 'B' },
              ]
            },
            {
              id: 4,
              name: '4 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'b401', number: 'Б-401', name: 'Лаборатория кибербезопасности', x: 100, y: 100, width: 150, height: 100, floor: 4, building: 'B' },
                { id: 'b402', number: 'Б-402', name: 'Лаборатория сетей', x: 280, y: 100, width: 150, height: 100, floor: 4, building: 'B' },
                { id: 'b403', number: 'Б-403', name: 'Лаборатория баз данных', x: 460, y: 100, width: 150, height: 100, floor: 4, building: 'B' },
                { id: 'b404', number: 'Б-404', name: 'Лаборатория ИИ', x: 640, y: 100, width: 150, height: 100, floor: 4, building: 'B' },
                { id: 'b405', number: 'Б-405', name: 'Серверная', x: 100, y: 250, width: 120, height: 80, floor: 4, building: 'B' },
                { id: 'b406', number: 'Б-406', name: 'Кабинет администратора', x: 250, y: 250, width: 120, height: 80, floor: 4, building: 'B' },
                { id: 'b407', number: 'Б-407', name: 'Переговорная', x: 400, y: 250, width: 120, height: 80, floor: 4, building: 'B' },
                { id: 'b408', number: 'Б-408', name: 'Кабинет №1', x: 550, y: 250, width: 120, height: 80, floor: 4, building: 'B' },
              ]
            }
          ]
        },
        {
          id: 'C',
          name: 'Учебно-научный корпус (В)',
          floors: [
            {
              id: 1,
              name: '1 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'c101', number: 'В-101', name: 'Лекционная аудитория', x: 100, y: 100, width: 180, height: 120, floor: 1, building: 'C' },
                { id: 'c102', number: 'В-102', name: 'Лекционная аудитория', x: 310, y: 100, width: 180, height: 120, floor: 1, building: 'C' },
                { id: 'c103', number: 'В-103', name: 'Лекционная аудитория', x: 520, y: 100, width: 180, height: 120, floor: 1, building: 'C' },
                { id: 'c104', number: 'В-104', name: 'Переговорная', x: 100, y: 250, width: 120, height: 80, floor: 1, building: 'C' },
                { id: 'c105', number: 'В-105', name: 'Лаборатория №1', x: 250, y: 250, width: 150, height: 100, floor: 1, building: 'C' },
                { id: 'c106', number: 'В-106', name: 'Лаборатория №2', x: 430, y: 250, width: 150, height: 100, floor: 1, building: 'C' },
                { id: 'c107', number: 'В-107', name: 'Кабинет преподавателя', x: 610, y: 250, width: 120, height: 80, floor: 1, building: 'C' },
                { id: 'c108', number: 'В-108', name: 'Кабинет преподавателя', x: 100, y: 380, width: 120, height: 80, floor: 1, building: 'C' },
                { id: 'c109', number: 'В-109', name: 'Кабинет преподавателя', x: 250, y: 380, width: 120, height: 80, floor: 1, building: 'C' },
                { id: 'c110', number: 'В-110', name: 'Кабинет преподавателя', x: 400, y: 380, width: 120, height: 80, floor: 1, building: 'C' },
                { id: 'c111', number: 'В-111', name: 'Кабинет преподавателя', x: 550, y: 380, width: 120, height: 80, floor: 1, building: 'C' },
              ]
            },
            {
              id: 2,
              name: '2 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'c201', number: 'В-201', name: 'Лекционная аудитория', x: 100, y: 100, width: 180, height: 120, floor: 2, building: 'C' },
                { id: 'c202', number: 'В-202', name: 'Лекционная аудитория', x: 310, y: 100, width: 180, height: 120, floor: 2, building: 'C' },
                { id: 'c203', number: 'В-203', name: 'Лекционная аудитория', x: 520, y: 100, width: 180, height: 120, floor: 2, building: 'C' },
                { id: 'c204', number: 'В-204', name: 'Переговорная', x: 100, y: 250, width: 120, height: 80, floor: 2, building: 'C' },
                { id: 'c205', number: 'В-205', name: 'Лаборатория №3', x: 250, y: 250, width: 150, height: 100, floor: 2, building: 'C' },
                { id: 'c206', number: 'В-206', name: 'Лаборатория №4', x: 430, y: 250, width: 150, height: 100, floor: 2, building: 'C' },
                { id: 'c207', number: 'В-207', name: 'Кабинет преподавателя', x: 610, y: 250, width: 120, height: 80, floor: 2, building: 'C' },
                { id: 'c208', number: 'В-208', name: 'Кабинет преподавателя', x: 100, y: 380, width: 120, height: 80, floor: 2, building: 'C' },
                { id: 'c209', number: 'В-209', name: 'Кабинет преподавателя', x: 250, y: 380, width: 120, height: 80, floor: 2, building: 'C' },
                { id: 'c210', number: 'В-210', name: 'Кабинет преподавателя', x: 400, y: 380, width: 120, height: 80, floor: 2, building: 'C' },
                { id: 'c211', number: 'В-211', name: 'Кабинет преподавателя', x: 550, y: 380, width: 120, height: 80, floor: 2, building: 'C' },
              ]
            },
            {
              id: 3,
              name: '3 этаж',
              width: 800,
              height: 600,
              classrooms: [
                { id: 'c301', number: 'В-301', name: 'Лекционная аудитория', x: 100, y: 100, width: 180, height: 120, floor: 3, building: 'C' },
                { id: 'c302', number: 'В-302', name: 'Лекционная аудитория', x: 310, y: 100, width: 180, height: 120, floor: 3, building: 'C' },
                { id: 'c303', number: 'В-303', name: 'Лекционная аудитория', x: 520, y: 100, width: 180, height: 120, floor: 3, building: 'C' },
                { id: 'c304', number: 'В-304', name: 'Переговорная', x: 100, y: 250, width: 120, height: 80, floor: 3, building: 'C' },
                { id: 'c305', number: 'В-305', name: 'Лаборатория №5', x: 250, y: 250, width: 150, height: 100, floor: 3, building: 'C' },
                { id: 'c306', number: 'В-306', name: 'Лаборатория №6', x: 430, y: 250, width: 150, height: 100, floor: 3, building: 'C' },
                { id: 'c307', number: 'В-307', name: 'Кабинет преподавателя', x: 610, y: 250, width: 120, height: 80, floor: 3, building: 'C' },
                { id: 'c308', number: 'В-308', name: 'Кабинет преподавателя', x: 100, y: 380, width: 120, height: 80, floor: 3, building: 'C' },
              ]
            }
          ]
        }
      ];

      setBuildings(buildingsData);
      setLoading(false);
    };

    initializeBuildings();
  }, []);

  // Создаем SVG-схемы для каждого этажа
  useEffect(() => {
    if (!loading && buildings.length > 0) {
      buildings.forEach(building => {
        building.floors.forEach(floor => {
          // Создаем SVG для каждого этажа
          const svg = (
            <svg 
              key={`${building.id}-${floor.id}`} 
              width={floor.width} 
              height={floor.height} 
              className="bg-white rounded-lg border border-slate-200"
            >
              {/* Коридор */}
              <rect x="0" y="220" width={floor.width} height={60} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

              {/* Лестницы */}
              <rect x="20" y="300" width="60" height="120" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" rx="5" />
              <text x="50" y="365" textAnchor="middle" fontSize="12" fill="#64748b">Лестница</text>

              <rect x={floor.width - 80} y="300" width="60" height="120" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" rx="5" />
              <text x={floor.width - 50} y="365" textAnchor="middle" fontSize="12" fill="#64748b">Лестница</text>

              {/* Лифты */}
              <rect x="20" y="450" width="60" height="80" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1" rx="5" />
              <text x="50" y="495" textAnchor="middle" fontSize="12" fill="#0369a1">Лифт</text>

              <rect x={floor.width - 80} y="450" width="60" height="80" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1" rx="5" />
              <text x={floor.width - 50} y="495" textAnchor="middle" fontSize="12" fill="#0369a1">Лифт</text>

              {/* Аудитории */}
              {floor.classrooms.map(classroom => {
                const isHighlighted = highlightedClassroom?.id === classroom.id;
                return (
                  <g key={classroom.id}>
                    <rect
                      x={classroom.x}
                      y={classroom.y}
                      width={classroom.width}
                      height={classroom.height}
                      fill={isHighlighted ? "#fef3c7" : "#f8fafc"}
                      stroke={isHighlighted ? "#f59e0b" : "#cbd5e1"}
                      strokeWidth={isHighlighted ? 2 : 1}
                      rx="5"
                      className="cursor-pointer hover:fill-yellow-50 transition-colors"
                      onClick={() => setHighlightedClassroom(classroom)}
                    />
                    <text
                      x={classroom.x + classroom.width / 2}
                      y={classroom.y + classroom.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#1e293b"
                      fontWeight="500"
                    >
                      {classroom.number}
                    </text>
                  </g>
                );
              })}
            </svg>
          );

          floorPlansRef.current[`${building.id}-${floor.id}`] = svg;
        });
      });
    }
  }, [buildings, loading, highlightedClassroom]);

  // Поиск аудитории
  useEffect(() => {
    if (searchQuery.trim()) {
      // Ищем аудиторию по номеру
      let foundClassroom: Classroom | null = null;
      let foundBuilding: 'A' | 'B' | 'C' | null = null;
      let foundFloor: number | null = null;

      // Определяем корпус
      const buildingId = searchQuery.startsWith('Б-') ? 'B' : 
                        searchQuery.startsWith('В-') ? 'C' : 'A';

      // Ищем аудиторию
      for (const building of buildings) {
        if (building.id === buildingId) {
          for (const floor of building.floors) {
            const classroom = floor.classrooms.find(c => c.number === searchQuery);
            if (classroom) {
              foundClassroom = classroom;
              foundBuilding = building.id as 'A' | 'B' | 'C';
              foundFloor = floor.id;
              break;
            }
          }
        }
        if (foundClassroom) break;
      }

      if (foundClassroom && foundBuilding && foundFloor) {
        setSelectedBuilding(foundBuilding);
        setSelectedFloor(foundFloor);
        setHighlightedClassroom(foundClassroom);
      }
    }
  }, [searchQuery, buildings]);

  // Получаем текущий этаж
  const currentBuilding = buildings.find(b => b.id === selectedBuilding);
  const currentFloor = currentBuilding?.floors.find(f => f.id === selectedFloor);

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Карта корпусов
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Найдите нужный корпус и аудиторию
          </p>
        </div>
      </div>

      {/* Поиск по аудитории */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Введите номер аудитории (например, 305 или Б-204)"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Загрузка карты корпусов...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Выбор корпуса */}
          <div className="flex flex-wrap gap-2 mb-6">
            {buildings.map(building => (
              <button
                key={building.id}
                onClick={() => {
                  setSelectedBuilding(building.id as 'A' | 'B' | 'C');
                  setSelectedFloor(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition min-w-[180px] ${
                  selectedBuilding === building.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {building.name}
                </div>
              </button>
            ))}
          </div>

          {/* Выбор этажа */}
          <div className="flex flex-wrap gap-2 mb-6">
            {currentBuilding?.floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedFloor === floor.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {floor.name}
              </button>
            ))}
          </div>

          {/* Карта этажа */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 overflow-auto">
            <div className="flex justify-center">
              {currentFloor ? floorPlansRef.current[`${selectedBuilding}-${selectedFloor}`] : (
                <div className="text-center py-8 text-slate-500">
                  Этаж не найден
                </div>
              )}
            </div>
          </div>

          {/* Информация об выделенной аудитории */}
          {highlightedClassroom && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Аудитория {highlightedClassroom.number}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Корпус</p>
                  <p className="font-medium">
                    {buildings.find(b => b.id === highlightedClassroom.building)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Этаж</p>
                  <p className="font-medium">
                    {buildings.find(b => b.id === highlightedClassroom.building)?.floors.find(f => f.id === highlightedClassroom.floor)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Назначение</p>
                  <p className="font-medium">{highlightedClassroom.name}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapPage;
