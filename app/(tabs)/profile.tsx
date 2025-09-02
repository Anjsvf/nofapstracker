import { ResetHistoryCalendar } from "@/components/resets/ResetHistoryCalendar";
import { ManualSetupModal } from "@/components/setup/ManualSetupModal";
import { useTimer } from "@/hooks/useTimer";
import { BadgeService } from "@/services/badgeService";
import { StorageService } from "@/services/storageService";
import { ProfileData } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar, Share as ShareIcon, User } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
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
  const [totalResets, setTotalResets] = useState(0);
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [showResetCalendar, setShowResetCalendar] = useState(false);

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
        setTotalResets(profileData.totalResets || 0);
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
        setTotalResets(0);
        await StorageService.saveProfileData(newProfileData);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  }, []);

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

  const exportData = useCallback(() => {
    Alert.alert(
      "Exportar Dados",
      "Funcionalidade de exportação será implementada em versão futura."
    );
  }, []);

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

  const openResetCalendar = useCallback(() => {
    setShowResetCalendar(true);
  }, []);

  const currentBadge = BadgeService.getBadgeInfo(currentStreak);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
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
          <Text style={styles.username}>{username || "Usuário Anônimo"}</Text>
          {currentBadge && (
            <View style={styles.currentBadgeContainer}>
              <Text style={styles.currentBadgeText}>{currentBadge.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Sequência Atual</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalResets}</Text>
              <Text style={styles.statLabel}>Total de Resets</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{calculateDaysSinceJoin()}</Text>
              <Text style={styles.statLabel}>Dias no App</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {joinDate ? joinDate.getFullYear() : "2024"}
              </Text>
              <Text style={styles.statLabel}>Ano de Entrada</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <TouchableOpacity style={styles.actionButton} onPress={shareProgress}>
            <ShareIcon size={20} color="#64748b" />
            <Text style={styles.actionButtonText}>Compartilhar Progresso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openResetCalendar}>
            <Calendar size={20} color="#64748b" />
            <Text style={styles.actionButtonText}>Ver Histórico Completo de Resets</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Download size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Exportar Dados</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <Text style={styles.infoText}>
            Versão do App: 1.0.0{"\n"}
            {joinDate &&
              `Membro desde: ${joinDate.toLocaleDateString("pt-BR")}`}
          </Text>
        </View>
      </ScrollView>

      <ManualSetupModal
        visible={showManualSetup}
        onClose={() => setShowManualSetup(false)}
        onSetupComplete={handleManualSetup}
      />

      <ResetHistoryCalendar
        visible={showResetCalendar}
        onClose={() => setShowResetCalendar(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000000"
  },
  header: { alignItems: "center", paddingHorizontal: 20, marginBottom: 30 },
  title: { fontSize: 32, fontFamily: "Inter-Bold", color: "#ffffff" },
  content: { flex: 1, paddingHorizontal: 20 },
  profileCard: {
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  badgeAvatar: { width: 80, height: 80, borderRadius: 40 },
  username: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  currentBadgeContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#171a18ff",
  },
  currentBadgeText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#cdef11b1",
    textAlign: "center",
  },
  statsContainer: { marginBottom: 24 },
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
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
  },
  statValue: {
    fontSize: 28,
    fontFamily: "RobotoMono-Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#64748b",
    textAlign: "center",
  },
  actionsContainer: { marginBottom: 24 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginLeft: 12,
  },
  dangerButton: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  dangerButtonText: { color: "#ef4444" },
  infoContainer: { marginBottom: 40 },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#64748b",
    lineHeight: 20,
  },
});