import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/logo";
import { Property, Evaluation } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

export default function Dashboard() {
  const { data: evaluations, isLoading } = useQuery<(Evaluation & { property: Property })[]>({
    queryKey: ["/api/evaluations/history"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>История на оценките</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Зареждане на историята...
                </div>
              ) : evaluations && evaluations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Тип имот</TableHead>
                      <TableHead>Оценка</TableHead>
                      <TableHead className="text-right">Стойност</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          {format(new Date(evaluation.createdAt), 'dd.MM.yyyy', { locale: bg })}
                        </TableCell>
                        <TableCell>{evaluation.property.address}</TableCell>
                        <TableCell>
                          {evaluation.property.type === 'apartment' && 'Апартамент'}
                          {evaluation.property.type === 'house' && 'Къща'}
                          {evaluation.property.type === 'villa' && 'Вила'}
                          {evaluation.property.type === 'agricultural' && 'Земеделска земя'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={evaluation.score} className="w-24" />
                            <span className="text-sm">{evaluation.score}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          €{evaluation.estimatedValue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Все още няма направени оценки
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}