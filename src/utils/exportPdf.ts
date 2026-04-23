import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Tournament, PlayerStats } from '../types';

const DARK_BG = [18, 18, 18] as [number, number, number];
const CARD_BG = [40, 40, 40] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const MUTED = [142, 142, 147] as [number, number, number];
const PRIMARY = [79, 110, 247] as [number, number, number];
const ACCENT = [245, 158, 11] as [number, number, number];

export function exportTournamentPdf(tournament: Tournament, stats: PlayerStats[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── Background ──────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');

  // ── Header ───────────────────────────────────────────────────────────────────
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text(tournament.name, pageW / 2, y, { align: 'center' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Classic Americano', pageW / 2, y, { align: 'center' });
  y += 5;

  const dateStr = new Date(tournament.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.text(dateStr, pageW / 2, y, { align: 'center' });
  y += 5;

  doc.setTextColor(...MUTED);
  doc.text(
    `${tournament.players.length} Players  ·  ${tournament.courts.length} Court(s)  ·  ${tournament.rounds.length} Rounds  ·  ${tournament.pointsPerRound} pts/round`,
    pageW / 2, y, { align: 'center' },
  );
  y += 10;

  // Divider
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Leaderboard Table ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text('Leaderboard', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Player', 'Points', 'W', 'T', 'L']],
    body: stats.map((s) => [s.rank, s.name, s.points, s.wins, s.ties, s.losses]),
    styles: {
      fillColor: CARD_BG,
      textColor: WHITE,
      fontSize: 10,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [50, 50, 50] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 14, halign: 'center' },
    },
    // Highlight tied ranks with accent color
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const rank = Number(data.cell.raw);
        if (rank <= 3) {
          data.cell.styles.textColor = ACCENT;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Round Breakdown ──────────────────────────────────────────────────────────
  const completedRounds = tournament.rounds.filter((r) => r.completed || r.matches.some((m) => m.completed));
  if (completedRounds.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text('No rounds completed yet.', margin, y);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...WHITE);
    doc.text('Round Breakdown', margin, y);
    y += 6;

    for (const round of completedRounds) {
      // Check if we need a new page
      if (y > 255) {
        doc.addPage();
        doc.setFillColor(...DARK_BG);
        doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');
        y = 20;
      }

      // Round header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(`Round ${round.roundNumber}`, margin, y);
      y += 1;

      const rows = round.matches.map((m) => [
        `${m.team1[0]} & ${m.team1[1]}`,
        `${m.score1}  –  ${m.score2}`,
        `${m.team2[0]} & ${m.team2[1]}`,
      ]);

      if (round.restingPlayers.length > 0) {
        rows.push([`Resting: ${round.restingPlayers.join(', ')}`, '', '']);
      }

      // Usable width = pageW - 2*margin; score col fixed at 28mm; teams share the rest equally
      const usableW = pageW - 2 * margin;
      const scoreColW = 28;
      const teamColW = (usableW - scoreColW) / 2;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: usableW,
        body: rows,
        styles: {
          fillColor: CARD_BG,
          textColor: WHITE,
          fontSize: 9,
          cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
          overflow: 'linebreak',
        },
        alternateRowStyles: {
          fillColor: [50, 50, 50] as [number, number, number],
        },
        columnStyles: {
          0: { halign: 'left',   cellWidth: teamColW },
          1: { halign: 'center', cellWidth: scoreColW, fontStyle: 'bold', textColor: MUTED },
          2: { halign: 'right',  cellWidth: teamColW },
        },
        // Resting row spans all columns
        didParseCell: (data) => {
          const raw = String(data.cell.raw ?? '');
          if (raw.startsWith('Resting:') && data.column.index === 0) {
            data.cell.styles.textColor = MUTED;
            data.cell.styles.fontStyle = 'italic';
            data.cell.colSpan = 3;
          }
          if (raw === '' && data.section === 'body') {
            data.cell.styles.fillColor = undefined as any;
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 5;
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Padel Fresh  ·  ${tournament.name}  ·  Page ${i} of ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    );
  }

  const safeName = tournament.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`padelfresh_${safeName}.pdf`);
}
