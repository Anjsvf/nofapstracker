import { ManualSetupModal } from "@/components/setup/ManualSetupModal";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { useTimer } from "@/hooks/useTimer";
import { BadgeService } from "@/services/badgeService";
import { RotateCcw, Settings } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StreakDisplay } from "../../components/StreakDisplay/StreakDisplay"; // ← Nova importação

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
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 90 },
      ]}
    >
      <View style={styles.content}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Fap Zerø</Text>
          <Text style={styles.subtitle}>Sua jornada de autodisciplina</Text>
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

        {/* Relógio com Alavancas */}
        <View style={styles.timerWithLeversContainer}>
          <View style={styles.timerContainer}>
            <TimerDisplay
              currentDayElapsed={getCurrentDayElapsed()}
              totalElapsed={getTotalElapsed()}
              isRunning={timerState.isRunning}
              progress={getCurrentDayProgress()}
              onStartPress={startTimer}
            />
          </View>

          {/* Alavanca de Ajustar */}
          {timerState.isRunning && (
            <View style={styles.setupLeverContainer}>
              <View style={styles.leverBase}>
                <View style={styles.leverBaseInner} />
              </View>
              <View style={styles.leverHandle}>
                <TouchableOpacity
                  style={styles.leverButton}
                  onPress={showSetupModal}
                  activeOpacity={0.8}
                >
                  <View style={styles.setupLeverButton}>
                    <Settings size={18} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.setupLeverLabel}>Ajuste seu tempo</Text>
            </View>
          )}

          {/* Alavanca de Reset */}
          {timerState.isRunning && (
            <View style={styles.resetLeverContainer}>
              <View style={styles.leverBase}>
                <View style={styles.leverBaseInner} />
              </View>
              <View style={styles.leverHandle}>
                <TouchableOpacity
                  style={styles.leverButton}
                  onPress={resetTimer}
                  activeOpacity={0.8}
                >
                  <View style={styles.resetLeverButton}>
                    <RotateCcw size={18} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.resetLeverLabel}>Reset</Text>
            </View>
          )}
        </View>

        {/* Sequência com foguinho - agora em componente separado */}
        <StreakDisplay
          currentStreak={timerState.currentStreak}
          isTimerRunning={timerState.isRunning}
        />
      </View>

      <ManualSetupModal
        visible={showManualSetup}
        onClose={handleCloseModal}
        onSetupComplete={setupTimer}
      />
    </View>
  );
}

// ... (mantenha apenas os styles que ainda são usados no HomeScreen)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "#000000",
  },
  content: { flex: 1, justifyContent: "space-between" },
  header: { alignItems: "center" },
  title: { fontSize: 26, fontFamily: "Inter-Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter-Regular", color: "#64748b" },

  timerWithLeversContainer: {
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

  setupLeverContainer: {
    position: "absolute",
    left: 20,
    alignItems: "center",
    width: 60,
  },
  resetLeverContainer: {
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  setupLeverButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    borderWidth: 3,
    borderColor: "#93c5fd",
  },
  resetLeverButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderWidth: 3,
    borderColor: "#fca5a5",
  },
  setupLeverLabel: {
    fontSize: 10,
    color: "#3b82f6",
    fontFamily: "Inter-Medium",
    marginTop: 90,
    textAlign: "center",
  },
  resetLeverLabel: {
    fontSize: 10,
    color: "#ef4444",
    fontFamily: "Inter-Medium",
    marginTop: 90,
    textAlign: "center",
  },

  // === Badge ===
  badgeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#000",
  },
  badgeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#000000ff",
  },
  badgeText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Inter-SemiBold",
  },
});