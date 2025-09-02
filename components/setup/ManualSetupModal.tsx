import { CustomAlert } from "@/components/setup/CustomAlert/CustomAlert";
import { Import, RotateCcw, X } from "lucide-react-native";
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

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Configurar Progresso</Text>
              <Text style={styles.modalSubtitle}>
                Como você gostaria de começar sua jornada?
              </Text>

              {!setupType && (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => setSetupType("fresh")}
                  >
                    <RotateCcw size={32} color="#10b981" />
                    <Text style={styles.optionTitle}>Começar do Zero</Text>
                    <Text style={styles.optionDescription}>
                      Iniciar uma nova jornada a partir de agora
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => setSetupType("import")}
                  >
                    <Import size={32} color="#ffffff" />
                    <Text style={styles.optionTitle}>Importar Progresso</Text>
                    <Text style={styles.optionDescription}>
                      Continuar com progresso de outro app
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {setupType === "fresh" && (
                <View style={styles.confirmContainer}>
                  <Text style={styles.confirmTitle}>Começar do Zero</Text>
                  <Text style={styles.confirmDescription}>
                    Você iniciará uma nova jornada a partir de agora. Seu timer
                    começará em 0 dias, 0 horas, 0 minutos.
                  </Text>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleSetup}
                  >
                    <Text style={styles.confirmButtonText}>
                      Iniciar Jornada
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {setupType === "import" && (
                <View style={styles.importContainer}>
                  <Text style={styles.importTitle}>Importar Progresso</Text>
                  <Text style={styles.importDescription}>
                    Insira seu progresso atual de outro app:
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Dias Completos *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 50"
                      placeholderTextColor="#334155"
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
                        placeholderTextColor="#334155"
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
                        placeholderTextColor="#334155"
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
                    <Text style={styles.importButtonText}>
                      Importar Progresso
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {setupType && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSetupType(null)}
                >
                  <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#171a18ff",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: "100%",
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#334155",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    textAlign: "center",
  },
  confirmContainer: {
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 16,
  },
  confirmDescription: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 200,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    textAlign: "center",
  },
  importContainer: {
    alignItems: "stretch",
  },
  importTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  importDescription: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    marginBottom: 24,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeInput: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(186, 27, 27, 0.2)",
    textAlign: "center",
  },
  exampleContainer: {
    backgroundColor: "rgba(51, 65, 85, 0.38)", // Updated to use #334155 with opacity
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  exampleTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#ffffff",
    lineHeight: 20,
  },
  importButton: {
    backgroundColor: "#334155",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
  },
  importButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
  },
  backButton: {
    marginTop: 16,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#1f62c1ff",
  },
});
