import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get("window").width;

export default function App() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [sales, expenses, logs]);

  const loadData = async () => {
    try {
      const savedSales = await AsyncStorage.getItem("sales");
      const savedExpenses = await AsyncStorage.getItem("expenses");
      const savedLogs = await AsyncStorage.getItem("logs");
      if (savedSales) setSales(JSON.parse(savedSales));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (err) {
      console.log("Error loading data:", err);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("sales", JSON.stringify(sales));
      await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
      await AsyncStorage.setItem("logs", JSON.stringify(logs));
    } catch (err) {
      console.log("Error saving data:", err);
    }
  };

  const totalSales = sales.reduce((a, b) => a + b, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b, 0);
  const balance = totalSales - totalExpenses;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#eee" },
            tabBarActiveTintColor: "#00F5FF",
            tabBarInactiveTintColor: "#999",
          }}
        >
          <Tab.Screen
            name="Dashboard"
            children={() => (
              <Dashboard
                sales={sales}
                expenses={expenses}
                totalSales={totalSales}
                totalExpenses={totalExpenses}
                balance={balance}
              />
            )}
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
          />
          <Tab.Screen
            name="Sales"
            children={() => <Sales sales={sales} setSales={setSales} setLogs={setLogs} />}
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={size} color={color} /> }}
          />
          <Tab.Screen
            name="Expenses"
            children={() => <Expenses expenses={expenses} setExpenses={setExpenses} setLogs={setLogs} />}
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="trending-down" size={size} color={color} /> }}
          />
          <Tab.Screen
            name="Logs"
            children={() => <Logs logs={logs} />}
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard({ sales, expenses, totalSales, totalExpenses, balance }) {
  const maxLength = Math.max(sales.length, expenses.length);
  const labels = maxLength > 0 ? Array.from({ length: maxLength }, (_, i) => `${i + 1}`) : ["0"];
  const salesData = labels.map((_, i) => (sales[i] ? sales[i] : 0));
  const expensesData = labels.map((_, i) => (expenses[i] ? expenses[i] : 0));
  const balanceData = labels.map((_, i) => (sales[i] ? sales[i] : 0) - (expenses[i] ? expenses[i] : 0));

  const pieData = [
    { name: "Sales", population: totalSales, color: "rgba(0,245,255,0.7)", legendFontColor: "#000", legendFontSize: 14 },
    { name: "Expenses", population: totalExpenses, color: "rgba(255,49,49,0.7)", legendFontColor: "#000", legendFontSize: 14 },
    { name: "Balance", population: balance, color: "rgba(0,255,127,0.7)", legendFontColor: "#000", legendFontSize: 14 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.subTitle}>Total Balance</Text>
        <Text style={styles.balance}>₱ {balance}</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.salesText}>Sales: ₱ {totalSales}</Text>
          <Text style={styles.expenseText}>Expenses: ₱ {totalExpenses}</Text>
        </View>

        {/* Line Chart (Sales) */}
        <Text style={styles.chartTitle}>Sales Trend</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: salesData, color: () => "rgba(0,245,255,0.6)", strokeWidth: 2 }],
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0,0,0,${opacity * 0.6})`,
            labelColor: () => "#555",
          }}
          style={{ marginVertical: 20, borderRadius: 12 }}
        />

        {/* Bar Chart (Expenses) */}
        <Text style={styles.chartTitle}>Expenses Trend</Text>
        <BarChart
          data={{
            labels,
            datasets: [{ data: expensesData, color: () => "rgba(255,49,49,0.6)" }],
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0,0,0,${opacity * 0.6})`,
            labelColor: () => "#555",
          }}
          style={{ marginVertical: 20, borderRadius: 12 }}
        />

        {/* Pie Chart (Balance Distribution) */}
        <Text style={styles.chartTitle}>Balance Distribution</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
          style={{ marginVertical: 20, borderRadius: 12 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= SALES ================= */
function Sales({ sales, setSales, setLogs }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAmount, setCurrentAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSave = () => {
    if (!currentAmount) return;
    if (editingIndex !== null) {
      const updatedSales = [...sales];
      updatedSales[editingIndex] = parseFloat(currentAmount);
      setSales(updatedSales);
      setLogs((prev) => [...prev, `Edited Sale: ₱${currentAmount} at #${editingIndex + 1}`]);
    } else {
      setSales([...sales, parseFloat(currentAmount)]);
      setLogs((prev) => [...prev, `Added Sale: ₱${currentAmount}`]);
    }
    setCurrentAmount("");
    setEditingIndex(null);
    setModalVisible(false);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setCurrentAmount(sales[index].toString());
    setModalVisible(true);
  };

  const handleDelete = (index) => {
    Alert.alert("Delete Sale", `Are you sure you want to delete ₱${sales[index]}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          const updatedSales = [...sales];
          const removed = updatedSales.splice(index, 1);
          setSales(updatedSales);
          setLogs((prev) => [...prev, `Deleted Sale: ₱${removed[0]} at #${index + 1}`]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sales</Text>
      <FlatList
        data={sales}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.saleRow}>
            <Text style={styles.saleText}>₱ {item}</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handleEdit(index)}>
                <Ionicons name="pencil" size={24} color="#00F5FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Ionicons name="trash" size={24} color="#FF3131" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => { setEditingIndex(null); setCurrentAmount(""); setModalVisible(true); }}>
        <Ionicons name="add-circle" size={50} color="#00F5FF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingIndex !== null ? "Edit Sale" : "Add Sale"}</Text>
            <TextInput
              placeholder="Enter amount"
              keyboardType="numeric"
              value={currentAmount}
              onChangeText={setCurrentAmount}
              style={styles.modalInput}
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#FF3131" }]} onPress={() => { setModalVisible(false); setCurrentAmount(""); setEditingIndex(null); }}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= EXPENSES ================= */
function Expenses({ expenses, setExpenses, setLogs }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAmount, setCurrentAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSave = () => {
    if (!currentAmount) return;
    if (editingIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editingIndex] = parseFloat(currentAmount);
      setExpenses(updatedExpenses);
      setLogs((prev) => [...prev, `Edited Expense: ₱${currentAmount} at #${editingIndex + 1}`]);
    } else {
      setExpenses([...expenses, parseFloat(currentAmount)]);
      setLogs((prev) => [...prev, `Added Expense: ₱${currentAmount}`]);
    }
    setCurrentAmount("");
    setEditingIndex(null);
    setModalVisible(false);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setCurrentAmount(expenses[index].toString());
    setModalVisible(true);
  };

  const handleDelete = (index) => {
    Alert.alert("Delete Expense", `Are you sure you want to delete ₱${expenses[index]}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          const updatedExpenses = [...expenses];
          const removed = updatedExpenses.splice(index, 1);
          setExpenses(updatedExpenses);
          setLogs((prev) => [...prev, `Deleted Expense: ₱${removed[0]} at #${index + 1}`]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      <FlatList
        data={expenses}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.saleRow}>
            <Text style={styles.saleText}>₱ {item}</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handleEdit(index)}>
                <Ionicons name="pencil" size={24} color="#00F5FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Ionicons name="trash" size={24} color="#FF3131" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => { setEditingIndex(null); setCurrentAmount(""); setModalVisible(true); }}>
        <Ionicons name="add-circle" size={50} color="#00F5FF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingIndex !== null ? "Edit Expense" : "Add Expense"}</Text>
            <TextInput
              placeholder="Enter amount"
              keyboardType="numeric"
              value={currentAmount}
              onChangeText={setCurrentAmount}
              style={styles.modalInput}
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#FF3131" }]} onPress={() => { setModalVisible(false); setCurrentAmount(""); setEditingIndex(null); }}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= LOGS ================= */
function Logs({ logs }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Logs</Text>
      <FlatList
        data={logs.slice().reverse()}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Text style={styles.listItem}>{item}</Text>}
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 5, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "700", marginVertical: 15, color: "#000" },
  subTitle: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 10 },
  balance: { fontSize: 42, fontWeight: "bold", marginTop: 10, color: "#000" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  salesText: { color: "#000dff", fontWeight: "700", fontSize: 16 },
  expenseText: { color: "#FF3131", fontWeight: "700", fontSize: 16 },
  chartTitle: { fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  listItem: { fontSize: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEE", color: "#000" },
  saleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  saleText: { fontSize: 16, color: "#000" },
  iconRow: { flexDirection: "row", width: 70, justifyContent: "space-between" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#111", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#00F5FF", marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: "#00F5FF", padding: 12, borderRadius: 8, color: "#fff", marginBottom: 20, backgroundColor: "#222" },
  modalButton: { backgroundColor: "#00F5FF", padding: 12, borderRadius: 8, marginBottom: 10 },
  modalButtonText: { color: "#000", textAlign: "center", fontWeight: "700" },
  addButton: { position: "absolute", bottom: 30, right: 30, zIndex: 10 },
});
