//
//  HistoryManager.swift
//  ScanApp
//
//  Created by Antigravity on 5/31/26.
//

import Foundation
import Combine

struct HistoryItem: Identifiable, Codable, Equatable {
    var id = UUID()
    let text: String
    let format: String
    let date: Date
    
    var timeFormatted: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "hh:mm:ss a"
        return formatter.string(from: date)
    }
    
    var dateFormatted: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

class HistoryManager: ObservableObject {
    static let shared = HistoryManager()
    
    @Published var items: [HistoryItem] = []
    
    private let storageKey = "scanapp_history_items"
    
    init() {
        loadHistory()
    }
    
    func add(text: String, format: String) {
        // Prevent duplicate consecutive scans if they happen rapidly
        if let last = items.first, last.text == text && last.format == format && Date().timeIntervalSince(last.date) < 2 {
            return
        }
        
        let newItem = HistoryItem(text: text, format: format, date: Date())
        items.insert(newItem, at: 0)
        saveHistory()
    }
    
    func remove(item: HistoryItem) {
        items.removeAll { $0.id == item.id }
        saveHistory()
    }
    
    func clearAll() {
        items.removeAll()
        saveHistory()
    }
    
    private func saveHistory() {
        do {
            let data = try JSONEncoder().encode(items)
            UserDefaults.standard.set(data, forKey: storageKey)
        } catch {
            print("Failed to save history: \(error)")
        }
    }
    
    private func loadHistory() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return }
        do {
            items = try JSONDecoder().decode([HistoryItem].self, from: data)
        } catch {
            print("Failed to load history: \(error)")
        }
    }
}
