"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/treatment/theme-toggle";

export function AuthScreen({
  login,
  password,
  setLogin,
  setPassword,
  handleLogin,
  authError,
  isApiOffline,
  offlineError,
  theme,
  onThemeToggle,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md shadow-lg shadow-black/5 dark:shadow-black/20">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Вход для врача</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">План лечения • ООО "32-Норма"</p>
          </div>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} showLabel={false} />
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                placeholder="Логин"
                autoComplete="username"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Пароль"
                autoComplete="current-password"
                required
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>

          {authError ? (
            <Alert variant="destructive">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}
          {isApiOffline ? (
            <Alert>
              <AlertDescription>{offlineError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
