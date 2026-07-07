import React, { useMemo } from 'react';
import { format, startOfDay, isAfter } from 'date-fns';
import { getPlatformStyle } from '../../utils/platformStyles';
import { formatCurrencyAmount } from '../../utils/currency';
import { parseAmount, computeBalance, getPlatformKey } from '../../utils/excelLedger';

const ExcelPlatformTable = ({ platform, rows, onRowChange, selectedMonth, onPrevMonth, onNextMonth, readOnly = false }) => {
    const style = getPlatformStyle(platform.name, platform.slug);

    const cascadedRows = useMemo(() => {
        let prevBalance = 0;
        const today = startOfDay(new Date());
        
        return rows.map((row, index) => {
            const sendAmt = parseAmount(row.send);
            const paidAmt = parseAmount(row.paid);
            const depAmt = parseAmount(row.deposit);
            const isFutureDate = isAfter(startOfDay(row.date), today);
            
            let computedBf;
            if (index === 0) {
                computedBf = parseAmount(row.bf);
            } else if (isFutureDate && sendAmt === 0 && paidAmt === 0 && depAmt === 0) {
                // Do not cascade to future dates if they have no activity
                computedBf = 0;
            } else {
                computedBf = prevBalance;
            }
 
            const computedBalance = computedBf + sendAmt - paidAmt - depAmt;
            if (!isFutureDate || (sendAmt !== 0 || paidAmt !== 0 || depAmt !== 0)) {
                prevBalance = computedBalance;
            } else {
                prevBalance = 0; // Reset prevBalance for future inactive dates
            }
 
            return {
                ...row,
                cascadedBf: index === 0 ? row.bf : (computedBf === 0 ? '' : String(computedBf)),
                computedBalance
            };
        });
    }, [rows]);

    const totals = useMemo(
        () =>
            cascadedRows.reduce(
                (acc, row) => ({
                    send: acc.send + parseAmount(row.send),
                    paid: acc.paid + parseAmount(row.paid),
                    deposit: acc.deposit + parseAmount(row.deposit),
                }),
                { send: 0, paid: 0, deposit: 0 }
            ),
        [cascadedRows]
    );

    const handleChange = (dateKey, field, rawValue) => {
        const row = rows.find((item) => item.dateKey === dateKey);
        if (!row) return;

        const nextRow = { ...row, [field]: rawValue };
        nextRow.balance = computeBalance(nextRow.bf, nextRow.send, nextRow.paid, nextRow.deposit);
        onRowChange(getPlatformKey(platform), dateKey, nextRow);
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col mb-4">
            {/* Header: Title and Month Selection */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-100 bg-slate-50/50">
                <div className="flex items-center">
                    <h3 className="text-[11px] font-bold uppercase  text-brand-800">
                        {style.displayName}
                    </h3>
                </div>
                
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onPrevMonth}
                        className="px-2 py-0.5 rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-[10px] font-bold text-neutral-500 transition-colors cursor-pointer"
                        aria-label="Previous month"
                    >
                        &lt;
                    </button>
                    <div className="px-2 py-0.5 rounded border border-neutral-200 bg-white min-w-[80px] text-center">
                        <span className="text-[10px] font-bold text-brand-800 tracking-tight">
                            {format(selectedMonth, 'MMM yyyy')}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="px-2 py-0.5 rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-[10px] font-bold text-neutral-500 transition-colors cursor-pointer"
                        aria-label="Next month"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* Full view without maximum height or vertical scroll bar */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-[9px] table-fixed border-collapse border border-neutral-100">
                    <thead className="bg-slate-50/70 border-b border-neutral-200">
                        <tr className="text-[9px] font-black uppercase tracking-wider text-brand-700">
                            <th className="border border-neutral-100 px-1.5 py-1 text-left w-[20%]">Date</th>
                            <th className="border border-neutral-100 px-1 py-1 text-center w-[15%]">B/F</th>
                            <th className="border border-neutral-100 px-1 py-1 text-center w-[15%]">Send</th>
                            <th className="border border-neutral-100 px-1 py-1 text-center w-[15%]">Paid</th>
                            <th className="border border-neutral-100 px-1 py-1 text-center w-[15%]">Deposit</th>
                            <th className="border border-neutral-100 px-1.5 py-1 text-right w-[20%]">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {cascadedRows.map((row, index) => (
                            <tr
                                key={row.dateKey}
                                className="bg-white hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="border border-neutral-100 px-1.5 py-0.5 font-bold text-brand-800 whitespace-nowrap text-[9px]">
                                    {format(row.date, 'dd/MM/yyyy')}
                                </td>
                                {['bf', 'send', 'paid', 'deposit'].map((field) => {
                                    const isBf = field === 'bf';
                                    const isDisabled = (isBf && index > 0) || readOnly;
                                    const val = isBf ? (row.cascadedBf || '') : (row[field] || '');
                                    
                                    return (
                                        <td key={field} className="border border-neutral-100 px-1 py-0.5 text-center">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={val}
                                                onChange={(e) => handleChange(row.dateKey, field, e.target.value)}
                                                disabled={isDisabled}
                                                className={`w-full h-5 px-1 text-center bg-transparent tabular-nums outline-none text-[9px] ${
                                                    isDisabled 
                                                        ? 'text-neutral-400 font-bold bg-neutral-50/50 cursor-not-allowed' 
                                                        : 'hover:bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-brand-200 font-semibold text-neutral-700'
                                                }`}
                                                placeholder="-"
                                            />
                                        </td>
                                    );
                                })}
                                <td className="border border-neutral-100 px-1.5 py-0.5 text-right font-black text-brand-900 tabular-nums text-[9px]">
                                    {formatCurrencyAmount(row.computedBalance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-neutral-200 bg-neutral-50/90 shrink-0">
                <table className="w-full text-[9px] table-fixed border-collapse border border-neutral-100">
                    <tfoot>
                        <tr className="text-[9px] font-bold uppercase tracking-wider text-brand-900">
                            <td className="border border-neutral-100 px-1.5 py-1 w-[20%] whitespace-nowrap">Total</td>
                            <td className="border border-neutral-100 px-1 py-1 w-[15%] text-center text-neutral-300">—</td>
                            <td className="border border-neutral-100 px-1 py-1 w-[15%] text-center tabular-nums text-emerald-700 font-bold">
                                {formatCurrencyAmount(totals.send)}
                            </td>
                            <td className="border border-neutral-100 px-1 py-1 w-[15%] text-center tabular-nums text-indigo-700 font-bold">
                                {formatCurrencyAmount(totals.paid)}
                            </td>
                            <td className="border border-neutral-100 px-1 py-1 w-[15%] text-center tabular-nums text-rose-700 font-bold">
                                {formatCurrencyAmount(totals.deposit)}
                            </td>
                            <td className="border border-neutral-100 px-1.5 py-1 w-[20%] text-right text-neutral-300">—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default ExcelPlatformTable;
