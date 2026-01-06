import { ManualSetupModal } from "@/components/setup/ManualSetupModal";
import { useTimer } from "@/hooks/useTimer";
import { BadgeService } from "@/services/badgeService";
import { StorageService } from "@/services/storageService";
import { ProfileData } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import { Award, Calendar, Share as ShareIcon, TrendingUp, Trophy, User } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { setupTimer } = useTimer();
  const [username, setUsername] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const loadProfileData = useCallback(async () => {
    try {
      const [usernameData, timerData, profileData] = await Promise.all([
        StorageService.loadUsername(),
        StorageService.loadTimerState(),
        StorageService.loadProfileData(),
      ]);

      if (usernameData) setUsername(usernameData);
      if (timerData) setCurrentStreak(timerData.currentStreak || 0);

      if (profileData) {
        setJoinDate(
          profileData.joinDate ? new Date(profileData.joinDate) : null
        );
      } else {
        const now = new Date();
        const newProfileData: ProfileData = {
          totalResets: 0,
          joinDate: now.toISOString(),
        };
        setJoinDate(now);
        await StorageService.saveProfileData(newProfileData);
      }

      // Animações de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  }, [fadeAnim, scaleAnim]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const handleManualSetup = useCallback(
    (days: number, startTime: number) => {
      setupTimer(days, startTime);
      setShowManualSetup(false);
      setTimeout(() => loadProfileData(), 500);
    },
    [setupTimer, loadProfileData]
  );

  const shareProgress = useCallback(async () => {
    const currentBadge = BadgeService.getBadgeInfo(currentStreak);
    const message = `Estou há ${currentStreak} dias na minha jornada NoFap! ${
      currentBadge ? `Conquista atual: ${currentBadge.name}` : ""
    } 💪 #NoFap #SelfImprovement`;

    try {
      const result = await Share.share({
        message: message,
        title: "Meu Progresso NoFap",
      });

      if (result.action === Share.sharedAction) {
        console.log("Progresso compartilhado com sucesso!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Compartilhamento cancelado.");
      }
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível compartilhar o progresso.");
      console.error("Erro ao compartilhar:", error);
    }
  }, [currentStreak]);

  const calculateDaysSinceJoin = useCallback(() => {
    if (!joinDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [joinDate]);

  const getMotivationalMessage = useCallback(() => {
    if (currentStreak === 0) return "Comece sua jornada hoje!";
    if (currentStreak < 7) return "Primeiros passos! Continue firme!";
    if (currentStreak < 30) return "Momentum crescente!";
    if (currentStreak < 90) return "Transformação em progresso!";
    return "Lendário! Você é uma inspiração não Desista!";
  }, [currentStreak]);

  const currentBadge = BadgeService.getBadgeInfo(currentStreak);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Header com gradiente sutil */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Aprimorado */}
        <Animated.View 
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                {currentBadge ? (
                  <Image
                    source={currentBadge.imageSource}
                    style={styles.badgeAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <User size={48} color="#ffffff" />
                )}
              </View>
              {currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>🔥 {currentStreak}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.username}>{username || "Usuário Anônimo"}</Text>
          
          {currentBadge && (
            <View style={styles.currentBadgeContainer}>
              <Award size={16} color="#cdef11b1" style={{ marginRight: 6 }} />
              <Text style={styles.currentBadgeText}>{currentBadge.name}</Text>
            </View>
          )}

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((currentStreak / 365) * 100, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStreak < 365 
              ? `${365 - currentStreak} dias para 1 ano`
              : "Meta de 1 ano alcançada! 🎉"
            }
          </Text>
        </Animated.View>

        {/* Stats Grid Aprimorado */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>
            <Trophy size={20} color="#ffffff" /> Estatísticas
            
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color="#cdef11b1" />
              </View>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Sequência Atual</Text>
              <View style={styles.statDivider} />
              <Text style={styles.statSubtext}>dias consecutivos</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar size={24} color="#64748b" />
              </View>
              <Text style={styles.statValue}>{calculateDaysSinceJoin()}</Text>
              <Text style={styles.statLabel}>Dias no App</Text>
              <View style={styles.statDivider} />
              <Text style={styles.statSubtext}>desde o início</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Trophy size={24} color="#64748b" />
              </View>
              <Text style={styles.statValue}>
                {joinDate ? joinDate.getFullYear() : "2024"}
              </Text>
              <Text style={styles.statLabel}>Ano de Entrada</Text>
              <View style={styles.statDivider} />
              <Text style={styles.statSubtext}>membro desde</Text>
            </View>
          </View>
        </View>

        {/* Milestones Section */}
        {currentStreak > 0 && (
          <View style={styles.milestonesContainer}>
            <Text style={styles.sectionTitle}>Próximos Marcos</Text>
            <View style={styles.milestonesList}>
              {[7, 30, 90, 180, 365].map((milestone) => {
                const isCompleted = currentStreak >= milestone;
                const isNext = currentStreak < milestone && currentStreak >= (milestone / 2);
                
                return (
                  <View 
                    key={milestone}
                    style={[
                      styles.milestoneItem,
                      isCompleted && styles.milestoneCompleted,
                      isNext && styles.milestoneNext,
                    ]}
                  >
                    <View style={styles.milestoneIcon}>
                      {isCompleted ? (
                        <Text style={styles.milestoneIconText}>✓</Text>
                      ) : (
                        <Text style={styles.milestoneIconText}>{milestone}</Text>
                      )}
                    </View>
                    <View style={styles.milestoneContent}>
                      <Text style={[
                        styles.milestoneTitle,
                        isCompleted && styles.milestoneCompletedText
                      ]}>
                        {milestone} dias
                      </Text>
                      {!isCompleted && isNext && (
                        <Text style={styles.milestoneProgress}>
                          Faltam {milestone - currentStreak} dias
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Actions Container Aprimorado */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={shareProgress}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <ShareIcon size={20} color="#64748b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>Compartilhar Progresso</Text>
              <Text style={styles.actionButtonSubtext}>
                Inspire outras pessoas
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Container */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Versão: <Text style={styles.infoBold}>1.0.14</Text>
            </Text>
            {joinDate && (
              <Text style={styles.infoText}>
                Membro desde: <Text style={styles.infoBold}>
                  {joinDate.toLocaleDateString("pt-BR")}
                </Text>
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ManualSetupModal
        visible={showManualSetup}
        onClose={() => setShowManualSetup(false)}
        onSetupComplete={handleManualSetup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000000"
  },
  header: { 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  title: { 
    fontSize: 32, 
    fontFamily: "Inter-Bold", 
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#64748b",
    textAlign: "center",
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  profileCard: {
    backgroundColor: "#000",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#171a18ff",
  },
  profileHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#000",
  },
  badgeAvatar: { 
    width: 96, 
    height: 96, 
    borderRadius: 48 
  },
  streakBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#000",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#cdef11b1",
  },
  streakBadgeText: {
    fontSize: 12,
    fontFamily: "Inter-Bold",
    color: "#cdef11b1",
  },
  username: {
    fontSize: 26,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    marginBottom: 12,
    marginTop: 8,
  },
  currentBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#171a18ff",
    marginBottom: 20,
  },
  currentBadgeText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#cdef11b1",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#cdef11b1",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#64748b",
  },
  statsContainer: { 
    marginBottom: 24 
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#171a18ff",
  },
  statCardPrimary: {
    width: "100%",
    marginBottom: 16,
    borderColor: "#000",
    borderWidth: 1.5,
  },
  statIconContainer: {
    marginBottom: 12,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 32,
    fontFamily: "RobotoMono-Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  statDivider: {
    width: 30,
    height: 1,
    backgroundColor: "rgba(100, 116, 139, 0.3)",
    marginVertical: 8,
  },
  statSubtext: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    color: "#64748b",
    textAlign: "center",
  },
  milestonesContainer: {
    marginBottom: 24,
  },
  milestonesList: {
    gap: 10,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#171a18ff",
  },
  milestoneCompleted: {
    borderColor: "rgba(205, 239, 17, 0.3)",
    backgroundColor: "rgba(205, 239, 17, 0.05)",
  },
  milestoneNext: {
    borderColor: "rgba(59, 130, 246, 0.4)",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  milestoneIconText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: "#64748b",
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
  },
  milestoneCompletedText: {
    color: "#cdef11b1",
  },
  milestoneProgress: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#64748b",
    marginTop: 2,
  },
  actionsContainer: { 
    marginBottom: 24 
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(1, 2, 4, 0.74)",
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 2,
  },
  actionButtonSubtext: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#64748b",
  },
  infoContainer: { 
    marginBottom: 40 
  },
  infoCard: {
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 6,
  },
  infoBold: {
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
  },
});