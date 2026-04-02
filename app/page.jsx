"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/treatment/app-header";
import { AuthScreen } from "@/components/treatment/auth-screen";
import { CategoryTabs } from "@/components/treatment/category-tabs";
import { PatientDetailsForm } from "@/components/treatment/patient-details-form";
import { PlanActionsBar } from "@/components/treatment/plan-actions-bar";
import { SavedPlansPanel } from "@/components/treatment/saved-plans-panel";
import { ServicesCatalogPanel } from "@/components/treatment/services-catalog-panel";
import { SessionCheckScreen } from "@/components/treatment/session-check-screen";
import { TermsCard } from "@/components/treatment/terms-card";
import { TreatmentPlanTable } from "@/components/treatment/treatment-plan-table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEFAULT_SERVICES = {
  surgery: [
    { name: "Установка импланта Dentium (премиум)", price: 39500 },
    { name: "Установка импланта Dentium (базовая)", price: 33600 },
    { name: "Установка импланта Osstem", price: 4200 },
    { name: "Формирователь Dentium", price: 3600 },
    { name: "Формирователь Osstem", price: 15000 },
    { name: "Закрытый синус-лифтинг", price: 30000 },
    { name: "Закрытый синус + кость", price: 10000 },
    { name: "Открытый синус-лифтинг 1гр", price: 60000 },
    { name: "Открытый синус-лифтинг 2гр", price: 90000 },
    { name: "Открытый синус-лифтинг 3гр", price: 120000 },
    { name: "Направленная регенерация (1-2ед)", price: "6000-12000" },
    { name: "PRF-мембраны", price: 10000 },
    { name: "Удаление зуба (простое)", price: 3500 },
    { name: "Удаление зуба (сложное)", price: 6500 },
    { name: "Вскрытие абсцесса", price: 4000 },
    { name: "Пластика уздечки языка/губы", price: 5500 },
  ],
  ortho: [
    { name: "Металлокерамическая коронка", price: 7000 },
    { name: "Коронка из диоксида циркония", price: 18000 },
    { name: "Съемный протез (частичный)", price: 25000 },
    { name: "Полный съемный протез", price: 40000 },
    { name: "Временная коронка", price: 3000 },
    { name: "Культевая вкладка", price: 6500 },
    { name: "Бюгельный протез", price: 45000 },
  ],
};

const emptyUser = { id: null, login: "", display_name: "" };

function normalizePrice(raw) {
  const value = String(raw).trim().replace(",", ".");
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : value;
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({
    ok: false,
    message: "Некорректный ответ от API",
  }));

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || "Ошибка API");
  }
  return data;
}

export default function HomePage() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState(emptyUser);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [currentCat, setCurrentCat] = useState("surgery");
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [searchText, setSearchText] = useState("");
  const [plan, setPlan] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [savedPlans, setSavedPlans] = useState([]);
  const [savedSearch, setSavedSearch] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrResult, setOcrResult] = useState("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isApiOffline, setIsApiOffline] = useState(false);
  const [offlineError, setOfflineError] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson("/api/auth.php?action=session");
        if (!mounted) return;
        if (data.authenticated && data.user) {
          setUser(data.user);
          setDoctorName(data.user.display_name || data.user.login || "");
        }
      } catch (_err) {
        if (mounted) {
          setIsApiOffline(true);
          setOfflineError(
            "API недоступен. Проверьте размещение папки /api и настройки БД в api/config.php."
          );
        }
      } finally {
        if (mounted) setIsCheckingSession(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("dent_theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("dent_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user.id) return;
    const local = localStorage.getItem(`dent_services_${user.id}`);
    if (!local) return;
    try {
      const parsed = JSON.parse(local);
      if (parsed?.surgery && parsed?.ortho) {
        setServices(parsed);
      }
    } catch (_err) {
      // ignore invalid local storage
    }
  }, [user.id]);

  useEffect(() => {
    if (!user.id) return;
    localStorage.setItem(`dent_services_${user.id}`, JSON.stringify(services));
  }, [services, user.id]);

  const filteredServices = useMemo(() => {
    const list = services[currentCat] || [];
    const q = searchText.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.name.toLowerCase().includes(q));
  }, [services, currentCat, searchText]);

  const filteredSavedPlans = useMemo(() => {
    const q = savedSearch.trim().toLowerCase();
    if (!q) return savedPlans;
    return savedPlans.filter((item) => (item.patient_name || "").toLowerCase().includes(q));
  }, [savedPlans, savedSearch]);

  const totalAmount = useMemo(() => {
    return plan.reduce((acc, item) => {
      if (typeof item.price !== "number") return acc;
      return acc + item.price * item.quantity;
    }, 0);
  }, [plan]);

  async function loadSavedPlans() {
    try {
      const data = await apiJson("/api/plans.php?query=list");
      setSavedPlans(data.plans || []);
      setIsApiOffline(false);
      setOfflineError("");
    } catch (err) {
      setIsApiOffline(true);
      setOfflineError(err.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    try {
      const data = await apiJson("/api/auth.php?action=login", {
        method: "POST",
        body: JSON.stringify({ login, password }),
      });
      setUser(data.user || emptyUser);
      setDoctorName(data.user?.display_name || data.user?.login || "");
      setPassword("");
      setIsApiOffline(false);
      setOfflineError("");
    } catch (err) {
      setAuthError(err.message || "Ошибка авторизации");
    }
  }

  async function handleLogout() {
    try {
      await apiJson("/api/auth.php?action=logout", { method: "POST", body: "{}" });
    } catch (_err) {
      // ignore network errors on logout
    }
    setUser(emptyUser);
    setPlan([]);
    setSavedPlans([]);
    setPatientName("");
    setDoctorName("");
  }

  function addToPlan(item) {
    setPlan((prev) => {
      const index = prev.findIndex((entry) => entry.name === item.name);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = { ...copy[index], quantity: copy[index].quantity + 1 };
        return copy;
      }
      return [...prev, { name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function deleteService(serviceName) {
    const inPlan = plan.some((item) => item.name === serviceName);
    const warning = inPlan ? "\n\nУслуга уже есть в плане." : "";
    if (!window.confirm(`Удалить услугу "${serviceName}" из прайса?${warning}`)) return;
    setServices((prev) => ({
      ...prev,
      [currentCat]: prev[currentCat].filter((item) => item.name !== serviceName),
    }));
  }

  function updateQty(index, value) {
    const quantity = Math.max(1, Number.parseInt(value || "1", 10));
    setPlan((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  }

  function removeItem(index) {
    setPlan((prev) => prev.filter((_, i) => i !== index));
  }

  function addNewService() {
    const name = newName.trim();
    const priceRaw = newPrice.trim();
    if (!name || !priceRaw) {
      window.alert("Введите название и цену");
      return;
    }
    const price = normalizePrice(priceRaw);
    setServices((prev) => ({
      ...prev,
      [currentCat]: [...prev[currentCat], { name, price }],
    }));
    setNewName("");
    setNewPrice("");
    setIsAddFormVisible(false);
  }

  async function saveCurrentPlan() {
    if (!patientName.trim()) {
      window.alert("Укажите пациента");
      return;
    }

    const payload = {
      patient_name: patientName.trim(),
      doctor_name: doctorName.trim(),
      plan_date: planDate,
      plan_items: plan,
      services_snapshot: services,
    };

    try {
      await apiJson("/api/plans.php?query=save", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      window.alert("План сохранен");
      if (currentCat === "saved") await loadSavedPlans();
      setIsApiOffline(false);
      setOfflineError("");
    } catch (err) {
      setIsApiOffline(true);
      setOfflineError(err.message);
      window.alert("Не удалось сохранить в БД");
    }
  }

  async function loadSavedPlanById(planId) {
    try {
      const data = await apiJson(`/api/plans.php?query=get&id=${planId}`);
      const saved = data.plan;
      if (!saved) return;
      setPatientName(saved.patient_name || "");
      setDoctorName(saved.doctor_name || doctorName);
      setPlanDate(saved.plan_date || new Date().toISOString().slice(0, 10));
      setPlan(Array.isArray(saved.plan_items) ? saved.plan_items : []);
      if (saved.services_snapshot?.surgery && saved.services_snapshot?.ortho) {
        setServices(saved.services_snapshot);
      }
      setCurrentCat("surgery");
    } catch (err) {
      window.alert(err.message || "Не удалось загрузить план");
    }
  }

  async function deleteSavedPlanById(planId) {
    if (!window.confirm("Удалить сохраненный план?")) return;
    try {
      await apiJson(`/api/plans.php?query=delete&id=${planId}`, {
        method: "POST",
        body: "{}",
      });
      await loadSavedPlans();
    } catch (err) {
      window.alert(err.message || "Не удалось удалить план");
    }
  }

  async function parseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setOcrResult("Обработка файла...");
    setOcrText("");

    const ext = file.name.toLowerCase().split(".").pop();
    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"];

    try {
      if (imageExts.includes(ext) || file.type.startsWith("image/")) {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("rus");
        const imageDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const result = await worker.recognize(imageDataUrl);
        await worker.terminate();
        const text = result.data?.text || "";
        setOcrText(text);
        setOcrResult(text || "Текст не найден");
      } else if (ext === "docx") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value || "";
        setOcrText(text);
        setOcrResult(text || "Текст не найден");
      } else if (ext === "txt") {
        const text = await file.text();
        setOcrText(text);
        setOcrResult(text || "Текст не найден");
      } else {
        setOcrResult("Поддерживаются изображения, .docx и .txt");
      }
    } catch (err) {
      setOcrResult(`Ошибка: ${err.message || "не удалось распознать файл"}`);
    } finally {
      setIsParsingFile(false);
      event.target.value = "";
    }
  }

  function addParsedServices() {
    if (!ocrText.trim()) return;
    const lines = ocrText.split("\n").filter((line) => line.trim());
    let added = 0;

    const parsed = lines.map((line) => {
      const match = line.match(/(\d[\d\s]*\d|\d+)/);
      let price = "Цена не указана";
      let name = line.trim();
      if (match) {
        const num = match[0].replace(/\s/g, "");
        const numeric = Number.parseFloat(num);
        if (Number.isFinite(numeric)) {
          price = numeric;
          name = line.replace(match[0], "").trim();
        }
      }
      if (!name) name = "Услуга";
      added += 1;
      return { name, price };
    });

    setServices((prev) => ({
      ...prev,
      [currentCat]: [...prev[currentCat], ...parsed],
    }));
    window.alert(`Добавлено ${added} услуг`);
    setOcrText("");
    setOcrResult("");
  }

  function sendToMail() {
    const clinicName = 'ООО "32-Норма"';
    const clinicAddress = "Курская обл., Железногорск, ул. Маршала Жукова, 4А";
    const clinicPhone = "+7 (920) 717-09-79";
    const patient = patientName.trim() || "не указан";
    const doctor = doctorName.trim() || "не указан";
    const date = planDate || "не указана";

    const lines = plan.map((item) => {
      const sum = typeof item.price === "number" ? item.price * item.quantity : "—";
      const priceText = typeof item.price === "number" ? `${item.price} ₽` : String(item.price);
      const sumText = typeof sum === "number" ? `${sum} ₽` : String(sum);
      return `- ${item.name}: ${priceText} x ${item.quantity} = ${sumText}`;
    });

    const body = [
      clinicName,
      clinicAddress,
      clinicPhone,
      "",
      `Пациент: ${patient}`,
      `Врач: ${doctor}`,
      `Дата: ${date}`,
      "",
      "ПЛАН ЛЕЧЕНИЯ",
      ...lines,
      "",
      `ИТОГО: ${totalAmount.toLocaleString()} ₽`,
      "",
      "Срок действия плана: два месяца со дня подписания.",
      "В дальнейшем стоимость может измениться.",
      "Также согласно договору стоимость может измениться в процессе операции,",
      "о чем пациент будет предупрежден устно.",
      "",
      "С условиями согласен. Подпись _________________",
    ].join("\n");

    window.open(
      `https://e.mail.ru/cgi-bin/sentmsg?subject=${encodeURIComponent(
        "План лечения"
      )}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function selectCategory(cat) {
    setCurrentCat(cat);
    if (cat === "saved") {
      loadSavedPlans();
    }
  }

  if (isCheckingSession) {
    return <SessionCheckScreen />;
  }

  if (!user.id) {
    return (
      <AuthScreen
        login={login}
        password={password}
        setLogin={setLogin}
        setPassword={setPassword}
        handleLogin={handleLogin}
        authError={authError}
        isApiOffline={isApiOffline}
        offlineError={offlineError}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-border/70 bg-card shadow-xl shadow-black/5 dark:shadow-black/20">
          <AppHeader user={user} theme={theme} onThemeToggle={toggleTheme} onLogout={handleLogout} />

          {isApiOffline ? (
            <Alert className="mx-4 mt-4 border-amber-300/40 bg-amber-50/70 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200 sm:mx-6">
              <AlertDescription>{offlineError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.2fr_1fr]">
            <section className="space-y-6 print:hidden">
              <CategoryTabs currentCat={currentCat} onSelect={selectCategory} />

              {currentCat !== "saved" ? (
                <ServicesCatalogPanel
                  searchText={searchText}
                  setSearchText={setSearchText}
                  filteredServices={filteredServices}
                  addToPlan={addToPlan}
                  deleteService={deleteService}
                  parseFile={parseFile}
                  isParsingFile={isParsingFile}
                  ocrResult={ocrResult}
                  ocrText={ocrText}
                  addParsedServices={addParsedServices}
                  isAddFormVisible={isAddFormVisible}
                  setIsAddFormVisible={setIsAddFormVisible}
                  newName={newName}
                  setNewName={setNewName}
                  newPrice={newPrice}
                  setNewPrice={setNewPrice}
                  addNewService={addNewService}
                />
              ) : (
                <SavedPlansPanel
                  savedSearch={savedSearch}
                  setSavedSearch={setSavedSearch}
                  filteredSavedPlans={filteredSavedPlans}
                  loadSavedPlanById={loadSavedPlanById}
                  deleteSavedPlanById={deleteSavedPlanById}
                />
              )}
            </section>

            <section className="space-y-4">
              <TreatmentPlanTable
                plan={plan}
                totalAmount={totalAmount}
                updateQty={updateQty}
                removeItem={removeItem}
              />

              <PatientDetailsForm
                patientName={patientName}
                setPatientName={setPatientName}
                planDate={planDate}
                setPlanDate={setPlanDate}
                doctorName={doctorName}
                setDoctorName={setDoctorName}
              />

              <TermsCard />

              <PlanActionsBar
                saveCurrentPlan={saveCurrentPlan}
                sendToMail={sendToMail}
                clearPlan={() => setPlan([])}
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
