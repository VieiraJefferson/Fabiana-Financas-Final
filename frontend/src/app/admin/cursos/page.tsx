"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  Play,
  Clock,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";

interface Video {
  _id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  videoUrl: string;
  status: 'published' | 'draft';
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'basic' | 'advanced' | 'premium';
  thumbnail: string;
  totalDuration: number;
  videosCount: number;
  enrollments: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  videos: Video[];
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnailFile: File | null;
  status: string;
}

interface VideoForm {
  title: string;
  description: string;
  videoFile: File | null;
  order: number;
}

export default function AdminCursosPage() {
  const { data: session } = useSession();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: '',
    level: 'basic',
    thumbnailFile: null,
    status: 'draft'
  });

  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: '',
    description: '',
    videoFile: null,
    order: 1
  });

  const categories = [
    'Orçamento',
    'Investimentos',
    'Aposentadoria',
    'Dívidas',
    'Economia',
    'Empreendedorismo',
    'Educação Financeira',
    'Criptomoedas',
    'Impostos'
  ];

  const levels = [
    { value: 'basic', label: 'Básico', color: 'bg-green-100 text-green-800' },
    { value: 'advanced', label: 'Avançado', color: 'bg-blue-100 text-blue-800' },
    { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-800' }
  ];

  const statuses = [
    { value: 'published', label: 'Publicado', color: 'bg-green-100 text-green-800' },
    { value: 'draft', label: 'Rascunho', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'archived', label: 'Arquivado', color: 'bg-gray-100 text-gray-800' }
  ];

  // Buscar cursos
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada real para API
      // const response = await fetch('http://localhost:5001/api/admin/courses');
      // const data = await response.json();
      // setCourses(data);
      
      // Dados mockados por enquanto
      setCourses([
        {
          _id: '1',
          title: 'Fundamentos do Orçamento Pessoal',
          description: 'Curso completo sobre como criar e manter um orçamento eficiente',
          category: 'Orçamento',
          level: 'basic',
          thumbnail: '/placeholder-course.jpg',
          totalDuration: 3600,
          videosCount: 4,
          enrollments: 1250,
          status: 'published',
          createdAt: '2024-01-15',
          videos: [
            {
              _id: '1-1',
              title: 'Introdução ao Orçamento',
              description: 'O que é orçamento e por que é importante',
              duration: 900,
              order: 1,
              videoUrl: 'https://example.com/video1',
              status: 'published'
            },
            {
              _id: '1-2',
              title: 'Como Categorizar Gastos',
              description: 'Aprenda a organizar suas despesas por categoria',
              duration: 1200,
              order: 2,
              videoUrl: 'https://example.com/video2',
              status: 'published'
            }
          ]
        }
      ]);
    } catch (error) {
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  // Upload de vídeo para Cloudinary
  const handleVideoUpload = async (videoFile: File) => {
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      setUploadProgress(0);
      
      // TODO: Implementar upload real
      // const response = await fetch('http://localhost:5001/api/admin/videos/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Simular upload por enquanto
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      
      return {
        url: 'https://res.cloudinary.com/dpilz4p6g/video/upload/v1/sample.mp4',
        duration: 900
      };
    } catch (error) {
      throw new Error('Erro no upload do vídeo');
    }
  };

  // Criar curso
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Upload thumbnail se fornecido
      // TODO: Criar curso na API

      toast.success("Curso criado com sucesso!");
      resetCourseForm();
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error("Erro ao criar curso");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar vídeo ao curso
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !videoForm.videoFile) return;

    setLoading(true);

    try {
      // Upload do vídeo
      const uploadResult = await handleVideoUpload(videoForm.videoFile);
      
      // TODO: Adicionar vídeo ao curso na API
      // await fetch(`http://localhost:5001/api/admin/courses/${selectedCourse._id}/videos`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: videoForm.title,
      //     description: videoForm.description,
      //     videoUrl: uploadResult.url,
      //     duration: uploadResult.duration,
      //     order: videoForm.order
      //   })
      // });

      toast.success("Vídeo adicionado com sucesso!");
      resetVideoForm();
      setIsVideoDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error("Erro ao adicionar vídeo");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: 'basic',
      thumbnailFile: null,
      status: 'draft'
    });
    setEditingCourse(null);
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      description: '',
      videoFile: null,
      order: 1
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getLevelBadge = (level: string) => {
    const levelData = levels.find(l => l.value === level);
    return levelData ? (
      <Badge className={levelData.color}>
        {levelData.label}
      </Badge>
    ) : null;
  };

  const getStatusBadge = (status: string) => {
    const statusData = statuses.find(s => s.value === status);
    return statusData ? (
      <Badge className={statusData.color}>
        {statusData.label}
      </Badge>
    ) : null;
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Gerenciar Cursos</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Crie e gerencie cursos com múltiplos vídeos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Editar Curso' : 'Criar Novo Curso'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações básicas do curso
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Curso</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    placeholder="Ex: Fundamentos do Orçamento"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={courseForm.category}
                    onValueChange={(value) => setCourseForm({...courseForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Select
                    value={courseForm.level}
                    onValueChange={(value) => setCourseForm({...courseForm, level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={courseForm.status}
                    onValueChange={(value) => setCourseForm({...courseForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="Descreva o conteúdo e objetivos do curso..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail do Curso</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCourseForm({...courseForm, thumbnailFile: e.target.files?.[0] || null})}
                />
              </div>

              <div className="flex flex-col lg:flex-row justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full lg:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="w-full lg:w-auto">
                  {loading ? 'Criando...' : editingCourse ? 'Atualizar' : 'Criar Curso'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Cursos */}
      <div className="grid gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
                    <CardTitle className="text-lg lg:text-xl">{course.title}</CardTitle>
                    <div className="flex gap-2">
                      {getLevelBadge(course.level)}
                      {getStatusBadge(course.status)}
                    </div>
                  </div>
                  <CardDescription className="text-sm">{course.description}</CardDescription>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.videosCount} vídeos
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.totalDuration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrollments} inscritos
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsVideoDialogOpen(true);
                    }}
                    className="flex-1 lg:flex-none"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Adicionar </span>Vídeo
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExpandedCourse(expandedCourse === course._id ? null : course._id);
                    }}
                    className="lg:flex-none"
                  >
                    {expandedCourse === course._id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                    <span className="hidden sm:inline ml-1">
                      {expandedCourse === course._id ? 'Ocultar' : 'Mostrar'}
                    </span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {expandedCourse === course._id && (
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Vídeos do Curso
                  </h4>
                  
                  {course.videos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Play className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Nenhum vídeo adicionado ainda</p>
                      <p className="text-sm">Clique em "Vídeo" para adicionar o primeiro vídeo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {course.videos
                        .sort((a, b) => a.order - b.order)
                        .map((video, index) => (
                        <div
                          key={video._id}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="font-medium">{video.title}</h5>
                            <p className="text-sm text-muted-foreground">{video.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">{formatDuration(video.duration)}</span>
                              {getStatusBadge(video.status)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Dialog para Adicionar Vídeo */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Adicionar Vídeo ao Curso</DialogTitle>
            <DialogDescription>
              {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoTitle">Título do Vídeo</Label>
              <Input
                id="videoTitle"
                value={videoForm.title}
                onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                placeholder="Ex: Introdução ao Orçamento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoDescription">Descrição</Label>
              <Textarea
                id="videoDescription"
                value={videoForm.description}
                onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                placeholder="Descreva o conteúdo do vídeo..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoFile">Arquivo de Vídeo</Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoForm({...videoForm, videoFile: e.target.files?.[0] || null})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={videoForm.order}
                onChange={(e) => setVideoForm({...videoForm, order: parseInt(e.target.value)})}
              />
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload do vídeo</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsVideoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploadProgress > 0}>
                {loading ? 'Enviando...' : 'Adicionar Vídeo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 