CREATE TABLE IF NOT EXISTS kemenag_ppid.data_statistik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(255) NOT NULL,
    nilai VARCHAR(50) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    urutan INT DEFAULT 0,
    is_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kemenag_ppid.data_infografis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    tanggal VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    image_url VARCHAR(500) NOT NULL,
    is_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
