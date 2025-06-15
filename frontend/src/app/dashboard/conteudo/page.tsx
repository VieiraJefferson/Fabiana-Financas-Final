"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";
import Image from "next/image";

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
}

interface UserPlan {
  type: 'basic' | 'advanced' | 'premium';
  expiresAt: string;
}

export default function ConteudoPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);

  // Simular plano do usuário - em produção viria da API
  const [userPlan, setUserPlan] = useState<UserPlan>({
    type: 'basic', // Pode ser 'basic', 'advanced', 'premium'
    expiresAt: '2024-12-31'
  });

  // Dados mockados - substituir por dados reais da API
  const [videos, setVideos] = useState<Video[]>([
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
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Estratégias de Investimento para Iniciantes',
      description: 'Primeiros passos no mundo dos investimentos com segurança',
      duration: '22:45',
      category: 'Investimentos',
      level: 'advanced',
      thumbnail: '/placeholder-video.jpg',
      videoUrl: 'https://example.com/video2',
      views: 890,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Planejamento de Aposentadoria Avançado',
      description: 'Estratégias sofisticadas para garantir uma aposentadoria confortável',
      duration: '35:20',
      category: 'Aposentadoria',
      level: 'premium',
      thumbnail: '/placeholder-video.jpg',
      videoUrl: 'https://example.com/video3',
      views: 456,
      createdAt: '2024-01-05'
    },
    {
      id: '4',
      title: 'Como Sair das Dívidas Rapidamente',
      description: 'Métodos comprovados para quitar dívidas e recuperar o controle financeiro',
      duration: '18:15',
      category: 'Dívidas',
      level: 'basic',
      thumbnail: '/placeholder-video.jpg',
      videoUrl: 'https://example.com/video4',
      views: 2100,
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      title: 'Análise de Carteira de Investimentos',
      description: 'Como analisar e otimizar sua carteira para máximo retorno',
      duration: '28:40',
      category: 'Investimentos',
      level: 'premium',
      thumbnail: '/placeholder-video.jpg',
      videoUrl: 'https://example.com/video5',
      views: 320,
      createdAt: '2024-01-08'
    },
    {
      id: '6',
      title: 'Economia Doméstica Inteligente',
      description: 'Dicas práticas para economizar no dia a dia sem perder qualidade de vida',
      duration: '12:30',
      category: 'Economia',
      level: 'basic',
      thumbnail: '/placeholder-video.jpg',
      videoUrl: 'https://example.com/video6',
      views: 1800,
      createdAt: '2024-01-18'
    }
  ]);

  const categories = ['all', 'Orçamento', 'Investimentos', 'Aposentadoria', 'Dívidas', 'Economia'];

  const canAccessVideo = (videoLevel: string) => {
    const levelHierarchy = { basic: 1, advanced: 2, premium: 3 };
    const userLevel = levelHierarchy[userPlan.type];
    const requiredLevel = levelHierarchy[videoLevel as keyof typeof levelHierarchy];
    return userLevel >= requiredLevel;
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      basic: { text: 'BÁSICO', color: 'bg-blue-100 text-blue-800' },
      advanced: { text: 'AVANÇADO', color: 'bg-purple-100 text-purple-800' },
      premium: { text: 'PREMIUM', color: 'bg-yellow-100 text-yellow-800' }
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  const filteredVideos = videos.filter(video => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVideoClick = (video: Video) => {
    if (!canAccessVideo(video.level)) {
      alert('Este conteúdo requer um plano superior. Faça upgrade para acessar!');
      router.push('/dashboard/mentoria');
      return;
    }
    setSelectedVideo(video);
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Video | null>(null);

  const handleWatchContent = (video: Video) => {
    if (!canAccessVideo(video.level)) {
      alert('Este conteúdo requer um plano superior. Faça upgrade para acessar!');
      router.push('/dashboard/mentoria');
      return;
    }
    setSelectedContent(video);
    setShowVideoDialog(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Conteúdo Exclusivo</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Biblioteca de vídeos educativos para acelerar seu aprendizado financeiro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Seu plano:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(userPlan.type).color}`}>
            {getLevelBadge(userPlan.type).text}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <span>🔍</span>
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto space-y-2">
            <Label>Categoria</Label>
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-auto space-y-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Player de Vídeo */}
      {selectedVideo && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{selectedVideo.title}</CardTitle>
                <CardDescription>{selectedVideo.description}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                ✕ Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
              <div className="text-center text-white">
                <span className="text-6xl mb-4 block">▶️</span>
                <p className="text-lg">Player de Vídeo</p>
                <p className="text-sm opacity-75">
                  (Integração com player real em breve)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>👁️ {formatViews(selectedVideo.views)} visualizações</span>
              <span>⏱️ {selectedVideo.duration}</span>
              <span>📅 {formatDate(selectedVideo.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Vídeos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const hasAccess = canAccessVideo(video.level);
          const badge = getLevelBadge(video.level);

          return (
            <Card 
              key={video.id} 
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                !hasAccess ? 'opacity-75' : ''
              }`}
              onClick={() => handleVideoClick(video)}
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <span className="text-4xl">🎬</span>
                
                {/* Badge de Nível */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                  {badge.text}
                </div>

                {/* Lock para conteúdo restrito */}
                {!hasAccess && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-3xl">🔒</span>
                  </div>
                )}

                {/* Duração */}
                <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{video.category}</span>
                    <span>👁️ {formatViews(video.views)}</span>
                  </div>
                </div>

                {!hasAccess && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      Faça upgrade para acessar este conteúdo
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem quando não há vídeos */}
      {filteredVideos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-lg font-semibold mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            <Button onClick={() => {
              setActiveCategory('all');
              setSearchTerm('');
            }}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CTA para Upgrade */}
      {userPlan.type !== 'premium' && (
        <Card className="bg-gradient-to-r from-primary/10 to-purple-100">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold mb-2">
              Desbloqueie Todo o Conteúdo
            </h3>
            <p className="text-muted-foreground mb-4">
              Acesse todos os vídeos exclusivos e acelere sua jornada financeira
            </p>
            <Button onClick={() => router.push('/dashboard/mentoria')}>
              Ver Planos Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Vídeo */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>{selectedContent?.description}</DialogDescription>
          </DialogHeader>
          <div className="aspect-video relative rounded-lg overflow-hidden">
            {/* Aqui você pode integrar um player de vídeo */}
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center text-white">
              <p>Player de vídeo será integrado aqui</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 