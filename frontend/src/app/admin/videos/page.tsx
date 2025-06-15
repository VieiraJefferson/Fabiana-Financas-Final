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

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: 'basic' | 'advanced' | 'premium';
  thumbnail: string;
  videoUrl: string;
  views: number;
  createdAt: string;
  status: 'published' | 'draft' | 'archived';
}

interface VideoForm {
  title: string;
  description: string;
  category: string;
  level: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  status: string;
}

export default function AdminVideosPage() {
  const { data: session } = useSession();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: '',
    description: '',
    category: '',
    level: 'basic',
    videoFile: null,
    thumbnailFile: null,
    status: 'published'
  });

  // Dados mockados - substituir por dados reais da API
  useEffect(() => {
    setVideos([
      {
        id: '1',
        title: 'Fundamentos do Orçamento Pessoal',
        description: 'Aprenda os conceitos básicos para criar e manter um orçamento eficiente',
        duration: '15:30',
        category: 'Orçamento',
        level: 'basic',
        thumbnail: '/placeholder-video.jpg',
        videoUrl: 'https://example.com/video1',
        views: 1250,
        createdAt: '2024-01-15',
        status: 'published'
      },
      {
        id: '2',
        title: 'Estratégias de Investimento Avançadas',
        description: 'Técnicas sofisticadas para maximizar seus investimentos',
        duration: '28:45',
        category: 'Investimentos',
        level: 'premium',
        thumbnail: '/placeholder-video.jpg',
        videoUrl: 'https://example.com/video2',
        views: 890,
        createdAt: '2024-01-10',
        status: 'published'
      },
      {
        id: '3',
        title: 'Planejamento de Aposentadoria',
        description: 'Como se preparar financeiramente para a aposentadoria',
        duration: '22:15',
        category: 'Aposentadoria',
        level: 'advanced',
        thumbnail: '/placeholder-video.jpg',
        videoUrl: 'https://example.com/video3',
        views: 456,
        createdAt: '2024-01-08',
        status: 'draft'
      }
    ]);
  }, []);

  const categories = [
    'Orçamento',
    'Investimentos',
    'Aposentadoria',
    'Dívidas',
    'Economia',
    'Empreendedorismo',
    'Educação Financeira'
  ];

  const levels = [
    { value: 'basic', label: 'Básico' },
    { value: 'advanced', label: 'Avançado' },
    { value: 'premium', label: 'Premium' }
  ];

  const statuses = [
    { value: 'published', label: 'Publicado' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'archived', label: 'Arquivado' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implementar upload de vídeo e thumbnail
      console.log('Video form:', videoForm);

      const newVideo: Video = {
        id: editingVideo?.id || Date.now().toString(),
        title: videoForm.title,
        description: videoForm.description,
        duration: '00:00', // Será calculado após upload
        category: videoForm.category,
        level: videoForm.level as Video['level'],
        thumbnail: '/placeholder-video.jpg', // URL após upload
        videoUrl: 'https://example.com/video', // URL após upload
        views: editingVideo?.views || 0,
        createdAt: editingVideo?.createdAt || new Date().toISOString(),
        status: videoForm.status as Video['status']
      };

      if (editingVideo) {
        setVideos(prev => prev.map(video => video.id === editingVideo.id ? newVideo : video));
        setSuccess("Vídeo atualizado com sucesso!");
      } else {
        setVideos(prev => [...prev, newVideo]);
        setSuccess("Vídeo adicionado com sucesso!");
      }

      // Reset form
      setVideoForm({
        title: '',
        description: '',
        category: '',
        level: 'basic',
        videoFile: null,
        thumbnailFile: null,
        status: 'published'
      });
      setEditingVideo(null);
      setIsDialogOpen(false);

    } catch (err: any) {
      setError("Erro ao salvar vídeo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description,
      category: video.category,
      level: video.level,
      videoFile: null,
      thumbnailFile: null,
      status: video.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (videoId: string) => {
    if (confirm('Tem certeza que deseja excluir este vídeo?')) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
      setSuccess("Vídeo excluído com sucesso!");
    }
  };

  const handleStatusChange = (videoId: string, newStatus: Video['status']) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, status: newStatus } : video
    ));
    setSuccess("Status do vídeo atualizado!");
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || video.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'text-success bg-success/10',
      draft: 'text-warning bg-warning/10',
      archived: 'text-muted-foreground bg-muted'
    };
    return colors[status as keyof typeof colors] || 'text-muted-foreground bg-muted';
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      basic: { text: 'BÁSICO', color: 'bg-blue-100 text-blue-800' },
      advanced: { text: 'AVANÇADO', color: 'bg-purple-100 text-purple-800' },
      premium: { text: 'PREMIUM', color: 'bg-yellow-100 text-yellow-800' }
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Vídeos</h1>
          <p className="text-muted-foreground">
            Gerencie todo o conteúdo de vídeo da plataforma
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVideo(null);
              setVideoForm({
                title: '',
                description: '',
                category: '',
                level: 'basic',
                videoFile: null,
                thumbnailFile: null,
                status: 'published'
              });
            }}>
              🎥 Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
              </DialogTitle>
              <DialogDescription>
                {editingVideo ? 'Atualize as informações do vídeo' : 'Faça upload de um novo vídeo para a plataforma'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Título do Vídeo *</Label>
                  <Input
                    placeholder="Ex: Fundamentos do Orçamento Pessoal"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm(prev => ({...prev, title: e.target.value}))}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva o conteúdo do vídeo..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm(prev => ({...prev, description: e.target.value}))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={videoForm.category} onValueChange={(value) => setVideoForm(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
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

                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select value={videoForm.level} onValueChange={(value) => setVideoForm(prev => ({...prev, level: value}))}>
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
                  <Label>Status</Label>
                  <Select value={videoForm.status} onValueChange={(value) => setVideoForm(prev => ({...prev, status: value}))}>
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

                <div className="space-y-2">
                  <Label>Arquivo de Vídeo</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoForm(prev => ({...prev, videoFile: e.target.files?.[0] || null}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVideoForm(prev => ({...prev, thumbnailFile: e.target.files?.[0] || null}))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : editingVideo ? "Atualizar" : "Adicionar Vídeo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-md">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-md">
          <p className="text-success text-sm">{success}</p>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍</span>
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Níveis</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vídeos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Vídeos ({filteredVideos.length})
        </h2>
        
        {filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <span className="text-6xl mb-4 block">🎥</span>
              <h3 className="text-lg font-semibold mb-2">Nenhum vídeo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterLevel !== 'all' || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro vídeo'
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Adicionar Primeiro Vídeo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredVideos.map((video) => {
              const badge = getLevelBadge(video.level);
              
              return (
                <Card key={video.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🎬</span>
                      </div>

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{video.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {video.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>📅 {formatDate(video.createdAt)}</span>
                              <span>⏱️ {video.duration}</span>
                              <span>👁️ {formatViews(video.views)} visualizações</span>
                              <span>📂 {video.category}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                              {badge.text}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(video.status)}`}>
                              {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                            ✏️ Editar
                          </Button>
                          
                          <Select 
                            value={video.status} 
                            onValueChange={(value) => handleStatusChange(video.id, value as Video['status'])}
                          >
                            <SelectTrigger className="w-32 h-8">
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

                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(video.id)}
                          >
                            🗑️ Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 