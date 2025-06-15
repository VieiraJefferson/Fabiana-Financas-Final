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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    maxVideoSize: number;
    maxVideosPerUser: number;
  };
  pricing: {
    basic: {
      price: number;
      features: string[];
    };
    advanced: {
      price: number;
      features: string[];
    };
    premium: {
      price: number;
      features: string[];
    };
  };
  notifications: {
    emailNotifications: boolean;
    welcomeEmail: boolean;
    paymentConfirmation: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
  };
  security: {
    passwordMinLength: number;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorAuth: boolean;
  };
  content: {
    autoApproveVideos: boolean;
    allowComments: boolean;
    moderateComments: boolean;
    maxCommentLength: number;
    allowVideoDownload: boolean;
  };
}

export default function AdminConfigPage() {
  const { data: session } = useSession();

  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      siteName: 'Fabi Finanças',
      siteDescription: 'Plataforma de educação financeira e mentoria',
      supportEmail: 'suporte@fabifinancas.com',
      maintenanceMode: false,
      allowRegistrations: true,
      maxVideoSize: 500, // MB
      maxVideosPerUser: 100
    },
    pricing: {
      basic: {
        price: 29.99,
        features: [
          'Acesso a vídeos básicos',
          'Suporte por email',
          'Comunidade exclusiva'
        ]
      },
      advanced: {
        price: 59.99,
        features: [
          'Todos os recursos do Basic',
          'Vídeos avançados',
          'Mentoria em grupo',
          'Planilhas exclusivas'
        ]
      },
      premium: {
        price: 99.99,
        features: [
          'Todos os recursos do Advanced',
          'Mentoria individual',
          'Acesso prioritário',
          'Conteúdo exclusivo'
        ]
      }
    },
    notifications: {
      emailNotifications: true,
      welcomeEmail: true,
      paymentConfirmation: true,
      weeklyDigest: false,
      marketingEmails: false
    },
    security: {
      passwordMinLength: 8,
      requireEmailVerification: true,
      sessionTimeout: 24, // horas
      maxLoginAttempts: 5,
      twoFactorAuth: false
    },
    content: {
      autoApproveVideos: false,
      allowComments: true,
      moderateComments: true,
      maxCommentLength: 500,
      allowVideoDownload: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implementar salvamento das configurações na API
      console.log('Salvando configurações:', settings);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Configurações salvas com sucesso!");
    } catch (err: any) {
      setError("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const updateGeneralSetting = (key: keyof PlatformSettings['general'], value: any) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }));
  };

  const updatePricingSetting = (plan: keyof PlatformSettings['pricing'], key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [plan]: {
          ...prev.pricing[plan],
          [key]: value
        }
      }
    }));
  };

  const updateNotificationSetting = (key: keyof PlatformSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updateSecuritySetting = (key: keyof PlatformSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const updateContentSetting = (key: keyof PlatformSettings['content'], value: any) => {
    setSettings(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: '⚙️' },
    { id: 'pricing', label: 'Preços', icon: '💰' },
    { id: 'notifications', label: 'Notificações', icon: '📧' },
    { id: 'security', label: 'Segurança', icon: '🔒' },
    { id: 'content', label: 'Conteúdo', icon: '📹' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da plataforma
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "💾 Salvar Configurações"}
        </Button>
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

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-6">
        {/* Tab Geral */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Site</Label>
                    <Input
                      value={settings.general.siteName}
                      onChange={(e) => updateGeneralSetting('siteName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email de Suporte</Label>
                    <Input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateGeneralSetting('supportEmail', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Descrição do Site</Label>
                    <Textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateGeneralSetting('siteDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho Máximo de Vídeo (MB)</Label>
                    <Input
                      type="number"
                      value={settings.general.maxVideoSize}
                      onChange={(e) => updateGeneralSetting('maxVideoSize', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de Vídeos por Usuário</Label>
                    <Input
                      type="number"
                      value={settings.general.maxVideosPerUser}
                      onChange={(e) => updateGeneralSetting('maxVideosPerUser', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modo de Manutenção</Label>
                      <p className="text-sm text-muted-foreground">
                        Desabilita o acesso à plataforma para usuários
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => updateGeneralSetting('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permitir Novos Cadastros</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que novos usuários se cadastrem
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.allowRegistrations}
                      onCheckedChange={(checked) => updateGeneralSetting('allowRegistrations', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Preços */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {Object.entries(settings.pricing).map(([planKey, plan]) => (
              <Card key={planKey}>
                <CardHeader>
                  <CardTitle className="capitalize">Plano {planKey}</CardTitle>
                  <CardDescription>
                    Configurações do plano {planKey}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={plan.price}
                      onChange={(e) => updatePricingSetting(planKey as keyof PlatformSettings['pricing'], 'price', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Recursos (um por linha)</Label>
                    <Textarea
                      value={plan.features.join('\n')}
                      onChange={(e) => updatePricingSetting(planKey as keyof PlatformSettings['pricing'], 'features', e.target.value.split('\n').filter(f => f.trim()))}
                      rows={5}
                      placeholder="Digite um recurso por linha"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab Notificações */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie as notificações enviadas aos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'emailNotifications' && 'Habilita o envio de emails'}
                      {key === 'welcomeEmail' && 'Email de boas-vindas para novos usuários'}
                      {key === 'paymentConfirmation' && 'Confirmação de pagamentos'}
                      {key === 'weeklyDigest' && 'Resumo semanal de atividades'}
                      {key === 'marketingEmails' && 'Emails promocionais e marketing'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateNotificationSetting(key as keyof PlatformSettings['notifications'], checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tab Segurança */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Configurações relacionadas à segurança da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamanho Mínimo da Senha</Label>
                  <Input
                    type="number"
                    min="6"
                    max="20"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout de Sessão (horas)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Máximo de Tentativas de Login</Label>
                  <Input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Verificação de Email Obrigatória</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários devem verificar o email antes de acessar
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSecuritySetting('requireEmailVerification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilita 2FA para todos os usuários
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Conteúdo */}
        {activeTab === 'content' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Conteúdo</CardTitle>
              <CardDescription>
                Configurações relacionadas ao conteúdo e moderação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tamanho Máximo de Comentário</Label>
                <Input
                  type="number"
                  min="100"
                  max="2000"
                  value={settings.content.maxCommentLength}
                  onChange={(e) => updateContentSetting('maxCommentLength', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovação Automática de Vídeos</Label>
                    <p className="text-sm text-muted-foreground">
                      Vídeos são publicados automaticamente sem moderação
                    </p>
                  </div>
                  <Switch
                    checked={settings.content.autoApproveVideos}
                    onCheckedChange={(checked) => updateContentSetting('autoApproveVideos', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Comentários</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários podem comentar nos vídeos
                    </p>
                  </div>
                  <Switch
                    checked={settings.content.allowComments}
                    onCheckedChange={(checked) => updateContentSetting('allowComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Moderar Comentários</Label>
                    <p className="text-sm text-muted-foreground">
                      Comentários precisam ser aprovados antes de aparecer
                    </p>
                  </div>
                  <Switch
                    checked={settings.content.moderateComments}
                    onCheckedChange={(checked) => updateContentSetting('moderateComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Download de Vídeos</Label>
                    <p className="text-sm text-muted-foreground">
                      Usuários podem baixar os vídeos
                    </p>
                  </div>
                  <Switch
                    checked={settings.content.allowVideoDownload}
                    onCheckedChange={(checked) => updateContentSetting('allowVideoDownload', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 