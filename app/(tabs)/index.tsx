import { ManualSetupModal } from "@/components/setup/ManualSetupModal";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { MotivationService } from "@/constants/MotivationService";
import { useTimer } from "@/hooks/useTimer";
import { BadgeService } from "@/services/badgeService";
import { LinearGradient } from "expo-linear-gradient";
import { Play, RotateCcw, Settings, TrendingUp } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    timerState,
    showManualSetup,
    startTimer,
    setupTimer,
    showSetupModal,
    handleCloseModal,
    resetTimer,
    getCurrentDayElapsed,
    getTotalElapsed,
    getCurrentDayProgress,
  } = useTimer();

  const currentBadge = BadgeService.getBadgeInfo(timerState.currentStreak);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 },
      ]}
    >
      <View style={styles.content}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Fap Zerø</Text>
          <Text style={styles.subtitle}>Sua jornada de autodisciplina</Text>
          {timerState.isRunning && (
            <TouchableOpacity
              style={styles.setupButton}
              onPress={showSetupModal}
            >
              <Settings size={18} color="#64748b" />
              <Text style={styles.setupButtonText}>Ajustar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Badge */}
        {currentBadge && (
          <View style={styles.badgeContainer}>
            <Image
              source={currentBadge.imageSource}
              style={styles.badgeImage}
              resizeMode="cover"
            />
            <Text style={styles.badgeText}>{currentBadge.name}</Text>
          </View>
        )}

        {/* Relógio com Alavanca */}
        <View style={styles.timerWithLeverContainer}>
          <View style={styles.timerContainer}>
            <TimerDisplay
              currentDayElapsed={getCurrentDayElapsed()}
              totalElapsed={getTotalElapsed()}
              isRunning={timerState.isRunning}
              progress={getCurrentDayProgress()}
            />
          </View>

          {/* Alavanca do lado direito */}
          {timerState.isRunning && (
            <View style={styles.leverContainer}>
              <View style={styles.leverBase}>
                <View style={styles.leverBaseInner} />
              </View>
              <View style={styles.leverHandle}>
                <TouchableOpacity
                  style={styles.leverButton}
                  onPress={resetTimer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#ef4444", "#dc2626"]}
                    style={styles.leverButtonGradient}
                  >
                    <RotateCcw size={18} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <Text style={styles.leverLabel}>Reset</Text>
            </View>
          )}
        </View>

        {/* Sequência */}
        <View style={styles.streakSection}>
          <View style={styles.streakContainer}>
            <View style={styles.streakHeader}>
              <TrendingUp size={16} color="#64748b" />
              <Text style={styles.streakLabel}>Sequência Atual</Text>
            </View>
            <Text style={styles.streakNumber}>{timerState.currentStreak}</Text>
            <Text style={styles.streakUnit}>dias consecutivos</Text>

            {timerState.currentStreak > 0 && (
              <Text style={styles.motivationText}>
                {MotivationService.getMotivationMessage(
                  timerState.currentStreak
                )}
              </Text>
            )}
          </View>
        </View>

        {/* Botão Iniciar (só aparece quando não está rodando) */}
        {!timerState.isRunning && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Play size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timerState.currentStreak}</Text>
            <Text style={styles.statLabel}>Dias</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.floor(getCurrentDayElapsed() / (1000 * 60 * 60)) || 0}
            </Text>
            <Text style={styles.statLabel}>Horas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(getCurrentDayProgress() * 100) || 0}%
            </Text>
            <Text style={styles.statLabel}>Progresso</Text>
          </View>
        </View>
      </View>

      <ManualSetupModal
        visible={showManualSetup}
        onClose={handleCloseModal}
        onSetupComplete={setupTimer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 12, 
    backgroundColor: "#000000" 
  },
  content: { flex: 1, justifyContent: "space-between" },
  header: { alignItems: "center" },
  title: { fontSize: 26, fontFamily: "Inter-Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter-Regular", color: "#64748b" },
  setupButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  setupButtonText: { fontSize: 12, color: "#64748b", marginLeft: 4 },

  // Container do timer com alavanca
  timerWithLeverContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0,
  },

  // Estilos da alavanca
  leverContainer: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    width: 60,
  },
  leverBase: {
    width: 20,
    height: 80,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
    borderWidth: 2,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  leverBaseInner: {
    width: 8,
    height: 60,
    backgroundColor: "#0f172a",
    borderRadius: 4,
  },
  leverHandle: {
    position: "absolute",
    top: -5,
    alignItems: "center",
  },
  leverButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  leverButtonGradient: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fca5a5",
  },
  leverLabel: {
    fontSize: 10,
    color: "#ef4444",
    fontFamily: "Inter-Medium",
    marginTop: 90,
    textAlign: "center",
  },

  streakSection: { marginVertical: 10 },
  streakContainer: { 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center",
    
  },
  streakHeader: { flexDirection: "row", alignItems: "center" },
  streakLabel: { fontSize: 14, color: "#64748b", marginLeft: 6 },
  streakNumber: { fontSize: 48, color: "#fff" },
  streakUnit: { fontSize: 14, color: "#64748b" },
  motivationText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 6,
    textAlign: "center",
  },
  badgeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    
  },
  badgeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  controlsContainer: { alignItems: "center" },
  startButton: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 20,
  },
  buttonText: { fontSize: 14, color: "#fff", marginLeft: 6 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderRadius: 12,
    padding: 12,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, color: "#fff" },
  statLabel: { fontSize: 10, color: "#64748b" },
  statDivider: { width: 1, backgroundColor: "rgba(100, 116, 139, 0.2)" },
});