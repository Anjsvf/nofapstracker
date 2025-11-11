import { CustomAlert } from "@/components/setup/CustomAlert/CustomAlert";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Import, RotateCcw, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ManualSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSetupComplete: (days: number, startTime: number) => void;
}

export function ManualSetupModal({
  visible,
  onClose,
  onSetupComplete,
}: ManualSetupModalProps) {
  const [setupType, setSetupType] = useState<"fresh" | "import" | null>(null);
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });

  const resetForm = () => {
    setSetupType(null);
    setDays("");
    setHours("");
    setMinutes("");
    setStartDate(new Date());
    setShowDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const showAlert = (
    title: string,
    message: string,
    buttons?: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: "OK", onPress: () => {}, style: "default" }],
    });
  };

  const validateInputs = () => {
    if (setupType === "import") {
      const daysNum = parseInt(days);
      const hoursNum = parseInt(hours) || 0;
      const minutesNum = parseInt(minutes) || 0;

      if (!days || daysNum < 0 || daysNum > 9999) {
        showAlert(
          "Erro",
          "Por favor, insira um número válido de dias (0-9999)"
        );
        return false;
      }

      if (hoursNum < 0 || hoursNum > 23) {
        showAlert("Erro", "Horas devem estar entre 0 e 23");
        return false;
      }

      if (minutesNum < 0 || minutesNum > 59) {
        showAlert("Erro", "Minutos devem estar entre 0 e 59");
        return false;
      }
    }

    return true;
  };

  const handleSetup = () => {
    if (!setupType) return;

    if (setupType === "fresh") {
      onSetupComplete(0, Date.now());
      handleClose();
      return;
    }

    if (!validateInputs()) return;

    const daysNum = parseInt(days);
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;

    const totalMilliseconds =
      daysNum * 24 * 60 * 60 * 1000 +
      hoursNum * 60 * 60 * 1000 +
      minutesNum * 60 * 1000;

    const calculatedStartTime = Date.now() - totalMilliseconds;

    showAlert(
      "Confirmar Importação",
      `Você está prestes a importar:\n• ${daysNum} dias completos\n• ${hoursNum} horas e ${minutesNum} minutos adicionais\n\nIsso desbloqueará as conquistas correspondentes. Continuar?`,
      [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Confirmar",
          onPress: () => {
            onSetupComplete(daysNum, calculatedStartTime);
            handleClose();
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>

            {setupType && (
              <TouchableOpacity
                style={styles.backButtonTop}
                onPress={() => setSetupType(null)}
              >
                <ChevronLeft size={24} color="#ffffff" />
              </TouchableOpacity>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {!setupType ? (
                <>
                  <Text style={styles.modalTitle}>Configurar Progresso</Text>
                  <Text style={styles.modalSubtitle}>
                    Como você gostaria de começar sua jornada?
                  </Text>

                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => setSetupType("fresh")}
                    >
                      <LinearGradient
                        colors={["#10b981", "#059669"]}
                        style={styles.optionIconGradient}
                      >
                        <RotateCcw size={32} color="#ffffff" />
                      </LinearGradient>
                      <Text style={styles.optionTitle}>Começar do Zero</Text>
                      <Text style={styles.optionDescription}>
                        Iniciar uma nova jornada a partir de agora
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => setSetupType("import")}
                    >
                      <LinearGradient
                        colors={["#3b82f6", "#1d4ed8"]}
                        style={styles.optionIconGradient}
                      >
                        <Import size={32} color="#ffffff" />
                      </LinearGradient>
                      <Text style={styles.optionTitle}>Importar Progresso</Text>
                      <Text style={styles.optionDescription}>
                        Continuar com progresso de outros apps ou etc
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : setupType === "fresh" ? (
                <>
                  <Text style={styles.confirmTitle}>Começar do Zero</Text>
                  <Text style={styles.confirmDescription}>
                    Você iniciará uma nova jornada a partir de agora. Seu timer
                    começará em 0 dias, 0 horas, 0 minutos.
                  </Text>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSetup}
                  >
                    <LinearGradient
                      colors={["#10b981", "#059669"]}
                      style={styles.confirmButtonGradient}
                    >
                      <Text style={styles.confirmButtonText}>
                        Iniciar Jornada
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.importTitle}>Importar Progresso</Text>
                  <Text style={styles.importDescription}>
                    Insira seu progresso atual de outro app ou etc:
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Dias Completos *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 50"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={days}
                      onChangeText={setDays}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>

                  <Text style={styles.additionalTimeLabel}>
                    Tempo Adicional (Opcional)
                  </Text>

                  <View style={styles.timeInputsContainer}>
                    <View style={styles.timeInputWrapper}>
                      <Text style={styles.inputLabel}>Horas</Text>
                      <TextInput
                        style={styles.timeInput}
                        placeholder="0"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={hours}
                        onChangeText={setHours}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>

                    <View style={styles.timeInputWrapper}>
                      <Text style={styles.inputLabel}>Minutos</Text>
                      <TextInput
                        style={styles.timeInput}
                        placeholder="0"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={minutes}
                        onChangeText={setMinutes}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </View>

                  <View style={styles.exampleContainer}>
                    <Text style={styles.exampleTitle}>Exemplo:</Text>
                    <Text style={styles.exampleText}>
                      • 50 dias, 12 horas, 30 minutos{"\n"}• Desbloqueará todas
                      as conquistas até 50 dias{"\n"}• Timer continuará a partir
                      desse ponto
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.importButton}
                    onPress={handleSetup}
                  >
                    <LinearGradient
                      colors={["#3b82f6", "#1d4ed8"]}
                      style={styles.importButtonGradient}
                    >
                      <Text style={styles.importButtonText}>
                        Importar Progresso
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#000000ff",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: "100%",
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  backButtonTop: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 80,
    
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmContainer: {
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 80,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  confirmDescription: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  confirmButton: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonGradient: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    minWidth: 220,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    textAlign: "center",
  },
  importContainer: {
    alignItems: "stretch",
  },
  importTitle: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 80,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  importDescription: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalTimeLabel: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  timeInputsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeInput: {
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exampleContainer: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exampleTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  importButton: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  importButtonGradient: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
  },
  importButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
  },
});