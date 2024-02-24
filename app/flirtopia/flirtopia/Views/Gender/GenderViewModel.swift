//
//  GenderViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import Foundation

class GenderViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var selectedGender: String = "Man"
    var choices = ["Man", "Woman"]
    @Published var navigate = false
    @Published var isButtonDisabled = false
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    
    func createGender() async throws {
        
        DispatchQueue.main.async {
            self.isButtonDisabled = true
        }
        
        defer {
            DispatchQueue.main.async {
                self.isButtonDisabled = false
            }
        }
        
        let url = URL(string: "\(baseUrl)/users/gender")!
        
        let jsonData: [String: Any] = [
            "gender": self.selectedGender.lowercased()
        ]
        
        let jsonDataSerialized = try JSONSerialization.data(withJSONObject: jsonData)
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = jsonDataSerialized
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        guard let token = KeychainManager().getTokenFromKeychain() else {
            self.errorMessage = "You must be logged in to access this page"
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
