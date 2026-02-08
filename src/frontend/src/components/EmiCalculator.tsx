import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { calculateEMI, type EMIResult } from '@/lib/emi';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Calculator, TrendingUp, DollarSign, Percent, History, Trash2, Upload } from 'lucide-react';
import { useEmiCalculationHistory } from '@/hooks/useEmiCalculationHistory';

type TenureUnit = 'years' | 'months';

export function EmiCalculator() {
  const [principal, setPrincipal] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [tenure, setTenure] = useState<string>('');
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('years');
  const [result, setResult] = useState<EMIResult | null>(null);
  const [errors, setErrors] = useState<{
    principal?: string;
    interestRate?: string;
    tenure?: string;
  }>({});

  const { history, isLoading: isHistoryLoading, addEntry, clearHistory } = useEmiCalculationHistory();

  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Validate principal
    const principalNum = parseFloat(principal);
    if (!principal || isNaN(principalNum) || principalNum <= 0) {
      newErrors.principal = 'Principal amount must be greater than 0';
      isValid = false;
    }

    // Validate interest rate
    const rateNum = parseFloat(interestRate);
    if (interestRate === '' || isNaN(rateNum) || rateNum < 0) {
      newErrors.interestRate = 'Interest rate must be 0 or greater';
      isValid = false;
    }

    // Validate tenure
    const tenureNum = parseFloat(tenure);
    if (!tenure || isNaN(tenureNum) || tenureNum <= 0) {
      newErrors.tenure = 'Tenure must be greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCalculate = () => {
    if (!validateInputs()) {
      setResult(null);
      return;
    }

    const principalNum = parseFloat(principal);
    const rateNum = parseFloat(interestRate);
    const tenureNum = parseFloat(tenure);
    const tenureInMonths = tenureUnit === 'years' ? tenureNum * 12 : tenureNum;

    const emiResult = calculateEMI(principalNum, rateNum, tenureInMonths);
    setResult(emiResult);

    // Add to history after successful calculation
    addEntry({
      principal: principalNum,
      annualInterestRate: rateNum,
      tenureMonths: tenureInMonths,
      monthlyEMI: emiResult.monthlyEMI,
      totalInterest: emiResult.totalInterest,
      totalPayment: emiResult.totalPayment,
    });
  };

  const handleReset = () => {
    setPrincipal('');
    setInterestRate('');
    setTenure('');
    setTenureUnit('years');
    setResult(null);
    setErrors({});
  };

  const handleLoadEntry = (entryId: string) => {
    const entry = history.find((e) => e.id === entryId);
    if (!entry) return;

    // Load values into form
    setPrincipal(entry.principal.toString());
    setInterestRate(entry.annualInterestRate.toString());
    
    // Set tenure and unit to match the saved tenureMonths exactly
    // Default to months for exact match
    setTenure(entry.tenureMonths.toString());
    setTenureUnit('months');
    
    // Clear any errors
    setErrors({});

    // Recalculate to show result
    const emiResult = calculateEMI(entry.principal, entry.annualInterestRate, entry.tenureMonths);
    setResult(emiResult);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Loan Details
            </CardTitle>
            <CardDescription>Enter your loan information to calculate EMI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Principal Amount */}
            <div className="space-y-2">
              <Label htmlFor="principal" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Principal Amount
              </Label>
              <Input
                id="principal"
                type="number"
                placeholder="e.g., 500000"
                value={principal}
                onChange={(e) => {
                  setPrincipal(e.target.value);
                  if (errors.principal) {
                    setErrors({ ...errors, principal: undefined });
                  }
                }}
                className={errors.principal ? 'border-destructive' : ''}
                min="0"
                step="1000"
              />
              {errors.principal && (
                <p className="text-sm text-destructive">{errors.principal}</p>
              )}
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Annual Interest Rate (%)
              </Label>
              <Input
                id="interestRate"
                type="number"
                placeholder="e.g., 8.5"
                value={interestRate}
                onChange={(e) => {
                  setInterestRate(e.target.value);
                  if (errors.interestRate) {
                    setErrors({ ...errors, interestRate: undefined });
                  }
                }}
                className={errors.interestRate ? 'border-destructive' : ''}
                min="0"
                step="0.1"
              />
              {errors.interestRate && (
                <p className="text-sm text-destructive">{errors.interestRate}</p>
              )}
            </div>

            {/* Tenure */}
            <div className="space-y-2">
              <Label htmlFor="tenure" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Loan Tenure
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tenure"
                  type="number"
                  placeholder="e.g., 20"
                  value={tenure}
                  onChange={(e) => {
                    setTenure(e.target.value);
                    if (errors.tenure) {
                      setErrors({ ...errors, tenure: undefined });
                    }
                  }}
                  className={`flex-1 ${errors.tenure ? 'border-destructive' : ''}`}
                  min="0"
                  step="1"
                />
                <Select value={tenureUnit} onValueChange={(value: TenureUnit) => setTenureUnit(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.tenure && (
                <p className="text-sm text-destructive">{errors.tenure}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCalculate} className="flex-1" size="lg">
                Calculate EMI
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>EMI Breakdown</CardTitle>
            <CardDescription>Your monthly payment details</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Monthly EMI - Highlighted */}
                <div className="p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Monthly EMI</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(result.monthlyEMI)}</p>
                </div>

                {/* Other Details */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Principal Amount</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(result.principal)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Interest</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(result.totalInterest)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Payment</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(result.totalPayment)}
                    </p>
                  </div>
                </div>

                {/* Summary Info */}
                <Alert className="bg-accent/50">
                  <AlertDescription className="text-sm">
                    You will pay <strong>{formatCurrency(result.monthlyEMI)}</strong> per month for{' '}
                    <strong>{formatNumber(result.tenureMonths)} months</strong>, totaling{' '}
                    <strong>{formatCurrency(result.totalPayment)}</strong>.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Calculator className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Enter loan details and click "Calculate EMI" to see your results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calculation History Section */}
      {!isHistoryLoading && history.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Calculation History
                </CardTitle>
                <CardDescription>
                  Your recent EMI calculations ({history.length} {history.length === 1 ? 'entry' : 'entries'})
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear calculation history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {history.length} saved calculation{history.length === 1 ? '' : 's'} from your browser. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {history.map((entry, index) => (
                  <div key={entry.id}>
                    <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadEntry(entry.id)}
                              className="h-8 gap-2 text-xs"
                            >
                              <Upload className="h-3 w-3" />
                              Load
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Principal:</span>{' '}
                              <span className="font-medium">{formatCurrency(entry.principal)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rate:</span>{' '}
                              <span className="font-medium">{entry.annualInterestRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tenure:</span>{' '}
                              <span className="font-medium">{formatNumber(entry.tenureMonths)} months</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monthly EMI:</span>{' '}
                              <span className="font-semibold text-primary">{formatCurrency(entry.monthlyEMI)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < history.length - 1 && <Separator className="my-3" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
