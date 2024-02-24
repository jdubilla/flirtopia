//
//  InterestsViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import Foundation

class InterestsViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var selectedTags: [String] = []
    @Published var tags: [Tag] = []
    @Published var navigate = false
    @Published var isButtonDisabled = false
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    
    init() {
        Task {
            try await self.fetchTags()
        }
    }
    
    func fetchTags() async throws {
        let url = URL(string: "\(baseUrl)/users/tags")!
        
        var request = URLRequest(url: url)
        
        guard let token = KeychainManager().getTokenFromKeychain() else {
            self.errorMessage = "You must be logged in to access this page"
            return
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let decoder = JSONDecoder()
        
        DispatchQueue.main.async {
            do {
                self.tags = try decoder.decode([Tag].self, from: data)
            } catch {
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
        }
    }
    
    func createInterests() async throws {
        
        DispatchQueue.main.async {
            self.isButtonDisabled = true
        }
        
        defer {
            DispatchQueue.main.async {
                self.isButtonDisabled = false
            }
        }
        
        let url = URL(string: "\(baseUrl)/users/interest")!
        
        let jsonData: [String: Any] = [
            "interests": self.selectedTags
        ]
        
        let jsonDataSerialized = try JSONSerialization.data(withJSONObject: jsonData)
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = jsonDataSerialized
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        guard let token = KeychainManager().getTokenFromKeychain() else {
            self.errorMessage = "You must be logged in to access this page"
            self.showAlert = true
            return
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            self.errorMessage = "Internal error"
            self.showAlert = true
            return
        }
        
        if (httpResponse.statusCode != 200) {
            DispatchQueue.main.async {
                self.errorMessage = "Please try again later"
                self.showAlert = true
            }
            return
        }
        
        DispatchQueue.main.async {
            self.navigate = true
        }
    }
}
