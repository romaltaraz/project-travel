import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { getLikesReport } from '../repositories/admin.repository.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';

export async function likesReport(_req: Request, res: Response): Promise<void> {
  const data = await getLikesReport();
  res.json(data);
}

export async function likesReportCsv(_req: Request, res: Response): Promise<void> {
  const [popular, ratingsByDest] = await Promise.all([
    analyticsRepo.getPopularVacations(),
    analyticsRepo.getRatingsByDestination(),
  ]);
  const ratingsById = new Map(ratingsByDest.map(r => [r.id, r]));

  const header = 'Destination,Bookings,Travelers,Likes,Avg Rating,Reviews,1 Star,2 Stars,3 Stars,4 Stars,5 Stars';
  const lines = [header, ...popular.map(v => {
    const r = ratingsById.get(v.id);
    return [
      `"${v.destination}"`,
      v.bookingsCount,
      v.travelersCount,
      v.likesCount,
      v.averageRating,
      v.reviewsCount,
      r?.rating1 ?? 0,
      r?.rating2 ?? 0,
      r?.rating3 ?? 0,
      r?.rating4 ?? 0,
      r?.rating5 ?? 0,
    ].join(',');
  })];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="destinations-report.csv"');
  res.send(lines.join('\n'));
}

export async function exportPdf(_req: Request, res: Response): Promise<void> {
  const [overview, popular, bookingStatus, ratingsByDest] = await Promise.all([
    analyticsRepo.getOverview(),
    analyticsRepo.getPopularVacations(),
    analyticsRepo.getBookingStatusBreakdown(),
    analyticsRepo.getRatingsByDestination(),
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
    ['Total Bookings', `${overview.totalBookings} (${overview.totalTravelers} travelers)`],
    ['Total Users',    String(overview.totalUsers)],
    ['Average Rating', `${overview.averageRating} / 5`],
    ['Total Likes',    String(overview.totalLikes)],
  ];
  kpis.forEach(([label, value]) => {
    doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value).font('Helvetica');
  });

  doc.moveDown(1);

  // Booking status breakdown
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#111').text('Booking Status');
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica').fillColor('#333');
  bookingStatus.forEach(s => {
    const label = s.status.charAt(0).toUpperCase() + s.status.slice(1);
    doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(String(s.count)).font('Helvetica');
  });

  doc.moveDown(2);

  // Top vacations by bookings
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text('Most Popular Vacations (by bookings)');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#333');
  popular.slice(0, 10).forEach((v, i) => {
    doc.text(
      `${i + 1}. ${v.destination} — ${v.bookingsCount} bookings (${v.travelersCount} travelers)  |  ` +
      `${v.likesCount} likes  |  Rating ${v.averageRating}`,
    );
  });

  doc.moveDown(2);

  // Ratings by destination — how many people rated each place, and what they gave it
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text('Ratings by Destination');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#333');
  const rated = ratingsByDest.filter(r => r.totalReviews > 0).sort((a, b) => b.totalReviews - a.totalReviews);
  if (rated.length === 0) {
    doc.text('No reviews yet.');
  } else {
    rated.slice(0, 10).forEach((r, i) => {
      doc.text(
        `${i + 1}. ${r.destination} — ${r.totalReviews} review${r.totalReviews !== 1 ? 's' : ''} ` +
        `(1-star: ${r.rating1}, 2-star: ${r.rating2}, 3-star: ${r.rating3}, 4-star: ${r.rating4}, 5-star: ${r.rating5})`,
      );
    });
  }

  doc.end();
}
