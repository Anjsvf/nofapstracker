
import { MotivationService } from "@/constants/MotivationService";
import { Flame, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";


const getFireIntensity = (streak: number) => {
  if (streak <= 0) return null;

  const cappedStreak = Math.min(streak, 30);
  const intensity = cappedStreak / 30;

  return {
    colors: {
      primary:
        streak < 7 ? "#ff9500" :
        streak < 14 ? "#ff6b00" :
        streak < 21 ? "#ff3d00" : "#ff0000",

      center:
        streak < 7 ? "#ffcc00" :
        streak < 14 ? "#ff9500" :
        streak < 21 ? "#ff6b00" : "#ff5500",
    },
    shadowRadius: 8 + intensity * 20,
    shadowOpacity: 0.6 + intensity * 0.4,
  };
};

type StreakDisplayProps = {
  currentStreak: number;
  isTimerRunning: boolean;
};

export function StreakDisplay({ currentStreak, isTimerRunning }: StreakDisplayProps) {
  const isFireLit = isTimerRunning && currentStreak >= 1;
  const fireIntensity = getFireIntensity(currentStreak);

  return (
    <View style={styles.streakSection}>
      <View style={styles.streakContainer}>
        <View style={styles.streakHeader}>
          <TrendingUp size={16} color="#64748b" />
          <Text style={styles.streakLabel}>Sequência Atual</Text>
        </View>

        <View style={styles.streakRow}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>

          <Flame
            size={48}
            color={isFireLit && fireIntensity ? fireIntensity.colors.primary : "#334155"}
            fill={isFireLit && fireIntensity ? fireIntensity.colors.center : "none"}
            style={[
            
              isFireLit &&
                fireIntensity && {
                  shadowColor: fireIntensity.colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: fireIntensity.shadowOpacity,
                  shadowRadius: fireIntensity.shadowRadius,
                },
              isFireLit && styles.fireLit,
            ]}
          />
        </View>

        <Text style={styles.streakUnit}>dias consecutivos</Text>

        {currentStreak > 0 && (
          <Text style={styles.motivationText}>
            {MotivationService.getMotivationMessage(currentStreak)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  streakSection: { marginVertical: 10 },
  streakContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#000",
  },
  streakHeader: { flexDirection: "row", alignItems: "center" },
  streakLabel: { fontSize: 14, color: "#64748b", marginLeft: 6 },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    gap: 3,
  },
  streakNumber: {
    fontSize: 48,
    color: "#fff",
    fontFamily: "Inter-Bold",
   
  },

  fireLit: {
    elevation: 14,
  },
  streakUnit: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  motivationText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 6,
    textAlign: "center",
    fontStyle: "italic",
  },
});