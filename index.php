<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>IYO Smart Pantry</title>

  <!-- Tailwind (dev) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React + ReactDOM UMD (dev) -->
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- Babel (dev) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-[#f6f5ea]">
  <div id="root"></div>

  <!-- If your ui.jsx still has TypeScript-ish annotations, include 'typescript' preset -->
  <script type="text/babel" data-presets="react,typescript" src="ui.jsx"></script>
</body>
</html>
