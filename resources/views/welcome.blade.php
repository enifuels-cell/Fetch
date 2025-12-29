<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fetch - Motorcycle Ride Booking System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            text-align: center;
        }
        h1 {
            color: #667eea;
            margin: 0 0 20px 0;
            font-size: 3em;
        }
        p {
            color: #666;
            font-size: 1.1em;
            line-height: 1.6;
        }
        .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            margin: 20px 0;
            font-weight: bold;
        }
        .api-link {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: bold;
            transition: background 0.3s;
        }
        .api-link:hover {
            background: #764ba2;
        }
        .features {
            text-align: left;
            margin: 30px 0;
        }
        .features ul {
            list-style: none;
            padding: 0;
        }
        .features li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .features li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏍️ Fetch</h1>
        <div class="status">✓ System Online</div>
        <p>Welcome to Fetch - A complete Laravel-based motorcycle ride-sharing platform with real-time location tracking and instant notifications.</p>
        
        <div class="features">
            <ul>
                <li>User Registration & Authentication</li>
                <li>Location-Based Rider Matching</li>
                <li>Real-Time Push Notifications</li>
                <li>Booking Management System</li>
                <li>Automated Fare Calculation</li>
                <li>Rating & Review System</li>
            </ul>
        </div>
        
        <a href="/api" class="api-link">View API Documentation</a>
        <p style="margin-top: 30px; font-size: 0.9em; color: #999;">
            Laravel v{{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})
        </p>
    </div>
</body>
</html>
