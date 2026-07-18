<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bukti Transaksi {{ $transaction->transaction_id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            padding: 40px;
            color: #333;
        }
        .header-table {
            width: 100%;
            border-bottom: 3px double #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-logo {
            width: 80px;
            height: auto;
        }
        .header-text {
            text-align: left;
            padding-left: 20px;
        }
        .header-small {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #333;
        }
        .header-large {
            font-size: 28px;
            font-weight: bold;
            color: #17803d; /* Hijau logo minhajussalam */
            margin: 3px 0;
            letter-spacing: 2px;
        }
        .title {
            text-align: center;
            margin-bottom: 30px;
        }
        .title h1 {
            font-size: 20px;
            text-decoration: underline;
        }

        .info-box {
            border: 1px solid #ddd;
            padding: 20px;
            margin-bottom: 30px;
            background: #f9f9f9;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            width: 150px;
        }
        .info-value {
            flex: 1;
        }
        .amount-box {
            text-align: center;
            padding: 30px;
            border: 2px solid #333;
            margin: 30px 0;
        }
        .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .amount-value {
            font-size: 32px;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-in {
            background: #d4edda;
            color: #155724;
        }
        .status-out {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            <td width="80" style="vertical-align: middle;">
                <img src="{{ public_path('minhajussalam.png') }}" class="header-logo" alt="Logo">
            </td>
            <td class="header-text">
                <div class="header-small">Dayah Perbatasan</div>
                <div class="header-large">MINHAJUSSALAM</div>
            </td>
        </tr>
    </table>

    <div class="title">
        <h1>BUKTI TRANSAKSI</h1>
    </div>

    <div class="info-box">
        <div class="info-row">
            <span class="info-label">ID Transaksi</span>
            <span class="info-value">: {{ $transaction->transaction_id }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tanggal</span>
            <span class="info-value">: {{ $transactionDate }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tipe</span>
            <span class="info-value">: {{ $typeLabel }} <span class="status {{ $transaction->type === 'in' ? 'status-in' : 'status-out' }}">{{ $transaction->type === 'in' ? 'MASUK' : 'KELUAR' }}</span></span>
        </div>
        <div class="info-row">
            <span class="info-label">Kategori</span>
            <span class="info-value">: {{ $transaction->category }}</span>
        </div>
        @if($transaction->student)
        <div class="info-row">
            <span class="info-label">Siswa</span>
            <span class="info-value">: {{ $transaction->student->name }} ({{ $transaction->student->nisn }})</span>
        </div>
        @endif
        @if($transaction->note)
        <div class="info-row">
            <span class="info-label">Catatan</span>
            <span class="info-value">: {{ $transaction->note }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Dicatat oleh</span>
            <span class="info-value">: {{ $transaction->user->name ?? '-' }}</span>
        </div>
    </div>

    <div class="amount-box">
        <div class="amount-label">JUMLAH</div>
        <div class="amount-value">Rp {{ $formattedAmount }}</div>
    </div>

    <div class="footer">
        <p>Dokumen ini dicetak pada {{ now()->format('d/m/Y H:i') }}</p>
        <p>Bukti transaksi ini merupakan dokumen resmi yang diterbitkan oleh sistem.</p>
    </div>
</body>
</html>