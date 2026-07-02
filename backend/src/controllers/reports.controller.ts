import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { getLikesReport } from '../repositories/admin.repository.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';

export async function likesReport(_req: Request, res: Response): Promise<void> {
  const data = await getLikesReport();
  res.json(data);
}

export async function likesReportCsv(_req: Request, res: Response): Promise<void> {
  const data = await getLikesReport();
  const lines = ['Destination,Likes', ...data.map(r => `"${r.destination}",${r.likesCount}`)];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="likes-report.csv"');
  res.send(lines.join('\n'));
}

export async function exportPdf(_req: Request, res: Response): Promise<void> {
  const [overview, popular, likesData] = await Promise.all([
    analyticsRepo.getOverview(),
    analyticsRepo.getPopularVacations(),
    getLikesReport(),
  ]);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="vacations-report.pdf"');
  doc.pipe(res);

  // Title
  doc.fontSize(24).font('Helvetica-Bold').text('Vacations Analytics Report', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#666')
    .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
  doc.moveDown(2);

  // KPI Overview
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text('Overview');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').fillColor('#333');
  const kpis = [
    ['Total Revenue',  `$${overview.totalRevenue.toLocaleString()}`],
    ['Total Bookings', String(overview.totalBookings)],
    ['Total Users',    String(overview.totalUsers)],
    ['Average Rating', `${overview.averageRating} / 5`],
    ['Total Likes',    String(overview.totalLikes)],
  ];
  kpis.forEach(([label, value]) => {
    doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value).font('Helvetica');
  });

  doc.moveDown(2);

  // Top vacations by bookings
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text('Most Popular Vacations (by bookings)');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#333');
  popular.slice(0, 10).forEach((v, i) => {
    doc.text(
      `${i + 1}. ${v.destination} — ${v.bookingsCount} bookings  |  ` +
      `${v.likesCount} likes  |  ★ ${v.averageRating}`,
    );
  });

  doc.moveDown(2);

  // Likes per destination
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text('Likes per Destination');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#333');
  likesData.slice(0, 10).forEach((r, i) => {
    doc.text(`${i + 1}. ${r.destination} — ${r.likesCount} likes`);
  });

  doc.end();
}
