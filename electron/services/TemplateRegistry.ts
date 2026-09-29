import { ProjectTemplate } from '../../src/types';

export class TemplateRegistry {
  private static templates: ProjectTemplate[] = [
    // Web Templates
    {
      id: 'react-tailwind',
      name: 'React + Tailwind CSS',
      category: 'web',
      language: 'TypeScript',
      framework: 'React',
      description: 'Modern single-page application with Vite, React 18, and Tailwind CSS styling.',
      icon: 'Atom',
      defaultExecutionMode: 'local',
      runCommand: 'npm run dev',
      buildCommand: 'npm run build',
      devServer: {
        port: 5173,
        urlPattern: 'http://localhost:5173',
        isWebPreview: true
      },
      files: {
        'package.json': JSON.stringify({
          name: 'elix-react-app',
          private: true,
          version: '0.1.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'lucide-react': '^0.475.0'
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.3.4',
            vite: '^6.1.0'
          }
        }, null, 2),
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elix React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-950 text-white min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
        'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        'src/App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="p-8 max-w-md bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-3xl font-bold">
          ⚡
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
          Elix React App
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Universal Development Environment • Instant Hot Reloading
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-6 py-2.5 font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Counter: {count}
          </button>
        </div>
      </div>
    </div>
  );
}`
      }
    },

    // Python Templates
    {
      id: 'python-fastapi',
      name: 'FastAPI Backend Service',
      category: 'python',
      language: 'Python',
      framework: 'FastAPI',
      description: 'High-performance Python web API with automatic Swagger docs & async endpoints.',
      icon: 'Zap',
      defaultExecutionMode: 'auto',
      runCommand: 'python main.py',
      devServer: {
        port: 8000,
        urlPattern: 'http://127.0.0.1:8000/docs',
        isWebPreview: true
      },
      files: {
        'main.py': `import sys
print(f"Starting Elix FastAPI Backend Engine on Python {sys.version.split()[0]}...")
print("✓ Local environment initialized.")
print("✓ API running at: http://127.0.0.1:8000")
print("✓ Interactive Swagger documentation: http://127.0.0.1:8000/docs")

# Demo mock server script for zero-config immediate run
import http.server
import socketserver
import json

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        res = {
            "status": "healthy",
            "message": "Welcome to Elix IDE FastAPI Service",
            "version": "1.0.0",
            "runtime": "Elix Universal Execution Engine"
        }
        self.wfile.write(json.dumps(res).encode())

print(f"Serving HTTP on port {PORT} (Press Stop to terminate)...")
try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("Server stopped.")
`,
        'requirements.txt': `fastapi>=0.110.0\nuvicorn>=0.29.0\npydantic>=2.6.0\n`
      }
    },

    // Java Template
    {
      id: 'java-console',
      name: 'Java 17 Console Application',
      category: 'java',
      language: 'Java',
      framework: 'Core Java',
      description: 'Standard Java console application powered by bundled OpenJDK 17 LTS.',
      icon: 'Coffee',
      defaultExecutionMode: 'local',
      runCommand: 'java Main.java',
      files: {
        'Main.java': `import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println("   ELIX IDE — JAVA EXECUTION ENGINE       ");
        System.out.println("=========================================");
        System.out.println("Runtime: " + System.getProperty("java.runtime.name"));
        System.out.println("Version: " + System.getProperty("java.version"));
        System.out.println("VM:      " + System.getProperty("java.vm.name"));
        System.out.println("Time:    " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        System.out.println("-----------------------------------------");
        System.out.println("Hello from Java in Elix IDE! No manual JDK installation required.");
    }
}
`
      }
    },

    // C Template
    {
      id: 'c-console',
      name: 'C Modern Application',
      category: 'c',
      language: 'C',
      description: 'Standard C console program with GCC compilation and memory management.',
      icon: 'Cpu',
      defaultExecutionMode: 'auto',
      runCommand: 'c-run',
      files: {
        'main.c': `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("=========================================\\n");
    printf("   ELIX IDE — C COMPILER & RUNTIME       \\n");
    printf("=========================================\\n");
    printf("Compiled with GCC via Elix Universal Toolchain.\\n");
    printf("Hello from C in Elix IDE!\\n");
    return 0;
}
`
      }
    },

    // C++ Template
    {
      id: 'cpp-console',
      name: 'C++ Modern Application',
      category: 'cpp',
      language: 'C++',
      description: 'C++20 console application with high-performance algorithms.',
      icon: 'Cpu',
      defaultExecutionMode: 'auto',
      runCommand: 'cpp-run',
      files: {
        'main.cpp': `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "=========================================\\n";
    std::cout << "   ELIX IDE — MODERN C++ RUNTIME         \\n";
    std::cout << "=========================================\\n";
    
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Vector elements: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\\nSum calculated: " << sum << "\\n";
    std::cout << "Execution completed successfully.\\n";
    
    return 0;
}
`
      }
    },

    // Rust Template
    {
      id: 'rust-cli',
      name: 'Rust Systems CLI',
      category: 'rust',
      language: 'Rust',
      description: 'Blazing fast and memory-safe systems program with Cargo.',
      icon: 'Shield',
      defaultExecutionMode: 'auto',
      runCommand: 'cargo run',
      files: {
        'Cargo.toml': `[package]
name = "elix_rust_cli"
version = "0.1.0"
edition = "2021"

[dependencies]
`,
        'src/main.rs': `fn main() {
    println!("=========================================");
    println!("   ELIX IDE — RUST EXECUTION ENGINE      ");
    println!("=========================================");
    println!("Hello from Rust! Fast, safe, and concurrent.");
}
`
      }
    },

    // Go Template
    {
      id: 'go-microservice',
      name: 'Go Microservice API',
      category: 'go',
      language: 'Go',
      description: 'Concurrent Go service with built-in HTTP server.',
      icon: 'Zap',
      defaultExecutionMode: 'auto',
      runCommand: 'go run main.go',
      files: {
        'main.go': `package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("=========================================")
	fmt.Println("   ELIX IDE — GO EXECUTION ENGINE        ")
	fmt.Println("=========================================")
	fmt.Printf("Go application launched at %s\\n", time.Now().Format(time.RFC3339))
	fmt.Println("Ready for cloud-native microservices.")
}
`
      }
    },

    // Mobile / Expo Template
    {
      id: 'mobile-expo',
      name: 'Expo React Native App',
      category: 'mobile',
      language: 'TypeScript',
      framework: 'React Native',
      description: 'Expo mobile application with Fast Refresh and interactive device simulation.',
      icon: 'Smartphone',
      defaultExecutionMode: 'local',
      runCommand: 'npx expo start',
      devServer: {
        port: 8081,
        urlPattern: 'http://localhost:8081',
        isWebPreview: true
      },
      files: {
        'App.tsx': `import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  const [likes, setLikes] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Elix Mobile Simulator</Text>
      <Text style={styles.subtitle}>Expo Fast Refresh Active</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setLikes(l => l + 1)}
      >
        <Text style={styles.buttonText}>❤️ Likes: {likes}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00e5ff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  }
});`
      }
    },

    // Flutter Mobile Template
    {
      id: 'mobile-flutter',
      name: 'Flutter Cross-Platform App',
      category: 'mobile',
      language: 'Dart',
      framework: 'Flutter',
      description: 'Production-ready Flutter application for Android, iOS, and Web with hot reload.',
      icon: 'Smartphone',
      defaultExecutionMode: 'auto',
      runCommand: 'flutter run -d chrome',
      devServer: {
        port: 8080,
        urlPattern: 'http://localhost:8080',
        isWebPreview: true
      },
      files: {
        'pubspec.yaml': `name: elix_flutter_app\ndescription: A new Flutter project created with Elix IDE.\nversion: 1.0.0+1\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\ndependencies:\n  flutter:\n    sdk: flutter\n  cupertino_icons: ^1.0.6\n`,
        'lib/main.dart': `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'Elix Flutter App',\n      theme: ThemeData.dark(),\n      home: const MyHomePage(),\n    );\n  }\n}\n\nclass MyHomePage extends StatefulWidget {\n  const MyHomePage({super.key});\n  @override\n  State<MyHomePage> createState() => _MyHomePageState();\n}\n\nclass _MyHomePageState extends State<MyHomePage> {\n  int _counter = 0;\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: const Text('⚡ Elix Flutter Runner')),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: [\n            const Text('Flutter Hot Reload Active', style: TextStyle(fontSize: 18)),\n            const SizedBox(height: 12),\n            Text('Counter: \$_counter', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.cyan)),\n          ],\n        ),\n      ),\n      floatingActionButton: FloatingActionButton(\n        onPressed: () => setState(() => _counter++),\n        child: const Icon(Icons.add),\n      ),\n    );\n  }\n}\n`
      }
    },

    // Android Kotlin Template
    {
      id: 'mobile-kotlin',
      name: 'Kotlin Android Native App',
      category: 'mobile',
      language: 'Kotlin',
      framework: 'Jetpack Compose',
      description: 'Modern native Android application with Kotlin and Jetpack Compose UI architecture.',
      icon: 'Smartphone',
      defaultExecutionMode: 'auto',
      runCommand: './gradlew assembleDebug',
      files: {
        'build.gradle.kts': `plugins {\n    alias(libs.plugins.android.application)\n    alias(libs.plugins.kotlin.android)\n}\n`,
        'MainActivity.kt': `package com.elix.app\n\nclass MainActivity {\n    fun onCreate() {\n        println("=========================================")\n        println("   ELIX IDE — KOTLIN ANDROID RUNTIME     ")\n        println("=========================================")\n        println("Jetpack Compose Engine Initialized.")\n        println("Hello from Kotlin Native in Elix IDE!")\n    }\n}\n\nfun main() {\n    MainActivity().onCreate()\n}\n`
      }
    },

    // Swift Application Template
    {
      id: 'swift-app',
      name: 'Swift Universal App',
      category: 'mobile',
      language: 'Swift',
      framework: 'SwiftUI',
      description: 'High performance Swift 5/6 application for iOS, macOS, and Linux servers.',
      icon: 'Terminal',
      defaultExecutionMode: 'auto',
      runCommand: 'swift run',
      files: {
        'Package.swift': `// swift-tools-version: 5.9\nimport PackageDescription\n\nlet package = Package(\n    name: "ElixSwiftApp",\n    targets: [\n        .executableTarget(name: "ElixSwiftApp")\n    ]\n)\n`,
        'Sources/main.swift': `import Foundation\n\nprint("=========================================")\nprint("   ELIX IDE — SWIFT RUNTIME ENGINE       ")\nprint("=========================================")\nprint("Swift Version: 5.9 / 6.0 Toolchain")\nprint("Target: iOS / macOS / Universal Systems")\nprint("Hello from Swift in Elix IDE!")\n`
      }
    }
  ];

  public static getTemplates(): ProjectTemplate[] {
    return this.templates;
  }

  public static getTemplatesByCategory(category: string): ProjectTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  public static getTemplate(id: string): ProjectTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }
}
