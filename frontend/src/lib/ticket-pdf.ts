import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface TicketPdfData {
	tiketId: string;
	namaPemohon: string;
	nik?: string;
	email?: string;
	phone?: string;
	pekerjaan?: string;
	alamat?: string;
	rincianInformasi: string;
	tujuan?: string;
	caraMemperoleh?: string;
	caraMendapatkan?: string;
	tglPengajuan: string;
	status?: string;
	siteUrl?: string;
	jenis?: 'PERMOHONAN' | 'KEBERATAN' | 'PENGADUAN' | string;
	tiketTerkait?: string;
	alasan?: string;
	kategori?: string;
}

export async function downloadTicketPdf(data: TicketPdfData) {
	// A4 Portrait (210mm x 297mm)
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
	});

	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 15;
	const contentWidth = pageWidth - margin * 2;
	let y = 16;

	const isKeberatan = data.jenis === 'KEBERATAN';
	const isPengaduan = data.jenis === 'PENGADUAN';

	// Warna aksen berdasarkan jenis layanan
	const brandColor = isKeberatan
		? { r: 180, g: 83, b: 9 } // Amber-700
		: isPengaduan
			? { r: 15, g: 118, b: 110 } // Teal-700
			: { r: 0, g: 113, b: 68 }; // Emerald

	const badgeBg = isKeberatan
		? { r: 254, g: 243, b: 199 }
		: isPengaduan
			? { r: 240, g: 253, b: 250 }
			: { r: 240, g: 253, b: 244 };

	const badgeBorder = isKeberatan
		? { r: 251, g: 191, b: 36 }
		: isPengaduan
			? { r: 153, g: 246, b: 228 }
			: { r: 167, g: 243, b: 208 };

	// Penentuan URL Lacak Otomatis untuk QR Code
	const origin =
		data.siteUrl ||
		(typeof window !== 'undefined' ? window.location.origin : 'https://ppid.kemenag-baritoutara.com');
	const trackingUrl = `${origin}?tiket=${encodeURIComponent(data.tiketId)}`;

	// Generate QR Code sebagai Data URL PNG
	let qrDataUrl = '';
	try {
		qrDataUrl = await QRCode.toDataURL(trackingUrl, {
			margin: 1,
			width: 280,
			color: {
				dark: isKeberatan ? '#854d0e' : isPengaduan ? '#0f766e' : '#004d2e',
				light: '#ffffff',
			},
			errorCorrectionLevel: 'M',
		});
	} catch (e) {
		console.error('Failed to generate QR Code:', e);
	}

	// --- 1. HEADER RINGKAS & MODERN (TANPA KOP SURAT LAMA) ---
	// Badge Atas
	doc.setFillColor(badgeBg.r, badgeBg.g, badgeBg.b);
	doc.setDrawColor(badgeBorder.r, badgeBorder.g, badgeBorder.b);
	doc.setLineWidth(0.4);
	const badgeWidth = isKeberatan ? 94 : isPengaduan ? 96 : 78;
	doc.roundedRect(margin, y, badgeWidth, 7, 2, 2, 'FD');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text(
		isKeberatan
			? 'PPID KEMENAG BARITO UTARA - LAYANAN KEBERATAN'
			: isPengaduan
				? 'KEMENAG BARITO UTARA - PENGADUAN & ASPIRASI'
				: 'PPID KEMENAG BARITO UTARA',
		margin + badgeWidth / 2,
		y + 4.8,
		{ align: 'center' },
	);

	// Tanggal Cetak di pojok kanan
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8);
	doc.setTextColor(100, 116, 139);
	doc.text(
		'Diterbitkan: ' + (data.tglPengajuan || new Date().toLocaleDateString('id-ID')),
		pageWidth - margin,
		y + 5,
		{ align: 'right' },
	);
	y += 12;

	// Judul Utama Dokumen
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(14.5);
	doc.setTextColor(15, 23, 42);
	doc.text(
		isKeberatan
			? 'TANDA TERIMA RESMI PENGAJUAN KEBERATAN INFORMASI'
			: isPengaduan
				? 'TANDA TERIMA RESMI PENGADUAN & ASPIRASI MASYARAKAT'
				: 'TANDA TERIMA RESMI PERMOHONAN INFORMASI PUBLIK',
		margin,
		y,
	);
	y += 5;

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8.5);
	doc.setTextColor(100, 116, 139);
	doc.text(
		isKeberatan
			? 'Bukti resmi pengajuan keberatan informasi publik kepada Atasan PPID (Pasal 35 & 36 UU KIP No. 14 Tahun 2008)'
			: isPengaduan
				? 'Bukti pendaftaran pengaduan kualitas pelayanan Kementerian Agama Kabupaten Barito Utara (UU No. 25 Tahun 2009)'
				: 'Bukti pendaftaran permohonan informasi publik online resmi (UU KIP No. 14 Tahun 2008 & Perki No. 1 Tahun 2021)',
		margin,
		y,
	);
	y += 7;

	// Garis Aksen
	doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
	doc.setLineWidth(1.2);
	doc.line(margin, y, margin + 45, y);
	doc.setDrawColor(226, 232, 240);
	doc.setLineWidth(0.4);
	doc.line(margin + 45, y, pageWidth - margin, y);
	y += 7;

	// --- 2. KOTAK TIKET DENGAN BARCODE / QR CODE INTERAKTIF ---
	const ticketBoxHeight = 36;
	doc.setFillColor(248, 250, 252); // slate-50
	doc.setDrawColor(203, 213, 225); // slate-300
	doc.setLineWidth(0.5);
	doc.roundedRect(margin, y, contentWidth, ticketBoxHeight, 3, 3, 'FD');

	// Kolom Kiri: Detail Nomor Registrasi Tiket
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8);
	doc.setTextColor(100, 116, 139);
	doc.text(
		isKeberatan
			? 'NOMOR REGISTRASI TIKET KEBERATAN:'
			: isPengaduan
				? 'NOMOR REGISTRASI TIKET PENGADUAN:'
				: 'NOMOR REGISTRASI TIKET:',
		margin + 6,
		y + 8,
	);

	doc.setFont('courier', 'bold');
	doc.setFontSize(18);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text(data.tiketId, margin + 6, y + 17);

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8);
	doc.setTextColor(100, 116, 139);
	doc.text('STATUS BERKAS:', margin + 6, y + 24);

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text(
		data.status ||
			(isKeberatan
				? 'MENUNGGU TANGGAPAN ATASAN PPID'
				: isPengaduan
					? 'MENUNGGU PENELAAHAN TIM PENGAWASAN'
					: 'MENUNGGU VERIFIKASI'),
		margin + 6,
		y + 29,
	);

	// Garis pembatas vertikal sebelum QR Code
	const qrDividerX = pageWidth - margin - 48;
	doc.setDrawColor(226, 232, 240);
	doc.setLineWidth(0.4);
	doc.line(qrDividerX, y + 4, qrDividerX, y + ticketBoxHeight - 4);

	// Kolom Kanan: QR Code Scannable
	const qrSize = 26;
	const qrX = pageWidth - margin - 38;
	const qrY = y + 3;

	if (qrDataUrl) {
		doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
	}

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(6.5);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text('SCAN UNTUK LACAK TIKET', qrX + qrSize / 2, y + 32.5, { align: 'center' });

	y += ticketBoxHeight + 8;

	// --- 3. TABEL DATA PEMOHON & RINCIAN ---
	const drawTableRow = (label: string, value: string, isMultiline = false): number => {
		const rowX = margin;
		const colLabelWidth = 55;
		const colValWidth = contentWidth - colLabelWidth;

		doc.setFont('helvetica', 'bold');
		doc.setFontSize(8.5);
		doc.setTextColor(71, 85, 105);

		// Format teks multilinea
		doc.setFont('helvetica', 'normal');
		const lines = doc.splitTextToSize(value || '-', colValWidth - 4);
		const rowHeight = Math.max(7, lines.length * 4.2 + 3);

		// Garis baris tabel
		doc.setFillColor(255, 255, 255);
		doc.setDrawColor(226, 232, 240);
		doc.setLineWidth(0.2);
		doc.rect(rowX, y, contentWidth, rowHeight, 'FD');

		// Label
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(51, 65, 85);
		doc.text(label, rowX + 3, y + 5);

		// Titik dua
		doc.text(':', rowX + colLabelWidth - 3, y + 5);

		// Isi Nilai
		doc.setFont('helvetica', isMultiline ? 'normal' : 'bold');
		doc.setTextColor(15, 23, 42);
		doc.text(lines, rowX + colLabelWidth, y + 5);

		y += rowHeight;
		return rowHeight;
	};

	// SEKSI 1: IDENTITAS
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9.5);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text(
		isKeberatan
			? 'I. DATA IDENTITAS PEMOHON KEBERATAN'
			: isPengaduan
				? 'I. DATA IDENTITAS PENGADU / PENYAMPAI ASPIRASI'
				: 'I. DATA IDENTITAS PEMOHON INFORMASI',
		margin,
		y,
	);
	y += 4;

	drawTableRow('Nama Pengadu / Pemohon', data.namaPemohon);
	if (data.nik) drawTableRow('Nomor Identitas (NIK KTP)', data.nik);
	if (data.phone) drawTableRow('Nomor WhatsApp / HP', data.phone);
	if (data.email) drawTableRow('Alamat Email Aktif', data.email);
	if (data.pekerjaan) drawTableRow('Pekerjaan / Profesi', data.pekerjaan);
	if (data.alamat) drawTableRow('Alamat Domisili', data.alamat, true);

	y += 6;

	// SEKSI 2: RINCIAN
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9.5);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text(
		isKeberatan
			? 'II. RINCIAN MATERI KEBERATAN INFORMASI'
			: isPengaduan
				? 'II. RINCIAN MATERI PENGADUAN & ASPIRASI'
				: 'II. RINCIAN PERMOHONAN INFORMASI YANG DIMINTA',
		margin,
		y,
	);
	y += 4;

	if (isKeberatan) {
		if (data.tiketTerkait) drawTableRow('Nomor Tiket Permohonan Awal', data.tiketTerkait);
		if (data.alasan) drawTableRow('Alasan Sah Keberatan (UU KIP)', data.alasan, true);
		drawTableRow('Kronologi / Rincian Keberatan', data.rincianInformasi, true);
	} else if (isPengaduan) {
		if (data.kategori) drawTableRow('Kategori Layanan yang Diadukan', data.kategori);
		drawTableRow('Uraian Pengaduan / Keluhan', data.rincianInformasi, true);
	} else {
		drawTableRow('Rincian Informasi Diminta', data.rincianInformasi, true);
		if (data.tujuan) drawTableRow('Tujuan Penggunaan Informasi', data.tujuan, true);
		if (data.caraMemperoleh) drawTableRow('Cara Memperoleh Informasi', data.caraMemperoleh);
		if (data.caraMendapatkan) drawTableRow('Format Penyerahan Salinan', data.caraMendapatkan);
	}

	y += 8;

	// --- 4. KETENTUAN HAK & PROSEDUR HUKUM ---
	doc.setFillColor(badgeBg.r, badgeBg.g, badgeBg.b);
	doc.setDrawColor(badgeBorder.r, badgeBorder.g, badgeBorder.b);
	doc.setLineWidth(0.3);
	doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(8);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text(
		isKeberatan
			? 'KETENTUAN HUKUM TANGGAPAN ATASAN PPID (PASAL 37 UU KIP NO. 14/2008):'
			: isPengaduan
				? 'KOMITMEN PENANGANAN PENGADUAN (UU NO. 25 TAHUN 2009 TENTANG PELAYANAN PUBLIK):'
				: 'KETENTUAN PELAYANAN & HAK PEMOHON (UU KIP NO. 14 TAHUN 2008):',
		margin + 4,
		y + 4.8,
	);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7.5);
	doc.setTextColor(51, 65, 85);
	if (isKeberatan) {
		doc.text(
			'1. Atasan PPID wajib memberikan tanggapan tertulis atas keberatan paling lambat 30 (tiga puluh) hari kerja sejak keberatan dicatat.',
			margin + 4,
			y + 9.5,
		);
		doc.text(
			'2. Jika tanggapan Atasan PPID tidak disepakati atau tidak diberikan, pemohon berhak mengajukan Sengketa Informasi ke Komisi Informasi dalam 14 hari kerja.',
			margin + 4,
			y + 13.8,
		);
		doc.text(
			'3. Scan QR Code di atas menggunakan smartphone untuk langsung memantau progres dan tindak lanjut Atasan PPID secara real-time.',
			margin + 4,
			y + 18.1,
		);
		doc.text(
			'4. Seluruh proses penanganan keberatan informasi publik resmi PPID Kementerian Agama adalah GRATIS (100% Bebas Biaya).',
			margin + 4,
			y + 22.4,
		);
	} else if (isPengaduan) {
		doc.text(
			'1. Setiap laporan pengaduan masyarakat akan ditelaah oleh Tim Pengawasan Internal Kemenag Barito Utara dalam 3-7 hari kerja.',
			margin + 4,
			y + 9.5,
		);
		doc.text(
			'2. Identitas pelapor dilindungi kerahasiaannya sesuai standar perlindungan saksi/pelapor dan UU Pelindungan Data Pribadi (UU PDP).',
			margin + 4,
			y + 13.8,
		);
		doc.text(
			'3. Scan QR Code di atas menggunakan smartphone untuk memantau status tindak lanjut pengaduan Anda pada portal resmi.',
			margin + 4,
			y + 18.1,
		);
		doc.text(
			'4. Layanan penanganan aspirasi dan pengaduan masyarakat ini adalah 100% GRATIS (tidak dipungut biaya apapun).',
			margin + 4,
			y + 22.4,
		);
	} else {
		doc.text(
			'1. PPID wajib memberikan pemberitahuan tertulis maksimal 10 (sepuluh) hari kerja sejak permohonan diterima lengkap.',
			margin + 4,
			y + 9.5,
		);
		doc.text(
			'2. Jangka waktu dapat diperpanjang maksimal 7 (tujuh) hari kerja berikutnya dengan pemberitahuan alasan tertulis yang sah.',
			margin + 4,
			y + 13.8,
		);
		doc.text(
			'3. Scan QR Code di atas menggunakan kamera smartphone untuk membuka portal dan langsung melihat progres tiket secara otomatis.',
			margin + 4,
			y + 18.1,
		);
		doc.text(
			'4. Pelayanan permohonan informasi publik resmi PPID Kementerian Agama tidak dipungut biaya (100% GRATIS).',
			margin + 4,
			y + 22.4,
		);
	}
	y += 30;

	// --- 5. PENGESAHAN DOKUMEN DIGITAL ---
	doc.setFont('helvetica', 'italic');
	doc.setFontSize(7.5);
	doc.setTextColor(148, 163, 184);
	doc.text(
		'Dokumen bukti pendaftaran ini diterbitkan secara otomatis oleh Sistem Elektronik PPID.',
		margin,
		y + 4,
	);
	doc.text(
		'Sah dan diakui tanpa tanda tangan basah berdasarkan UU ITE No. 1 Tahun 2024.',
		margin,
		y + 8,
	);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8);
	doc.setTextColor(30, 41, 59);
	doc.text(
		'Muara Teweh, ' + (data.tglPengajuan || new Date().toLocaleDateString('id-ID')),
		pageWidth - margin,
		y,
		{ align: 'right' },
	);
	doc.setFont('helvetica', 'bold');
	doc.text(
		isKeberatan
			? 'Sekretariat Layanan Keberatan PPID'
			: isPengaduan
				? 'Tim Pengawasan & Pengaduan Masyarakat'
				: 'Petugas Pelayanan Informasi Publik',
		pageWidth - margin,
		y + 4.5,
		{ align: 'right' },
	);
	doc.text('Kemenag Kabupaten Barito Utara', pageWidth - margin, y + 9, { align: 'right' });

	// Tanda tangan digital badge
	doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
	doc.setFillColor(badgeBg.r, badgeBg.g, badgeBg.b);
	doc.roundedRect(pageWidth - margin - 46, y + 12, 46, 8, 1.5, 1.5, 'FD');
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
	doc.text('[ TERVERIFIKASI SISTEM ]', pageWidth - margin - 23, y + 17, { align: 'center' });

	// Trigger direct automatic download
	const safeFilename = `${data.tiketId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
	doc.save(safeFilename);
}
