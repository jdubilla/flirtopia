//
//  SuggestionsViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import Foundation

class SuggestionsViewModel: ObservableObject {
    
    private let baseUrl: String = "http://localhost:3000"
    
    @Published var idsSuggested: [SuggestedUser] = []
    @Published var userSuggestions: [UserSuggestion] = []
    @Published var errorMessage: String = ""
    @Published var showAlert: Bool = false
    
    func getSuggestions() async throws {
        let baseUrl = "\(baseUrl)/users/suggestions"
        
        var urlComponents = URLComponents(string: baseUrl)!
        
        urlComponents.queryItems = [
            URLQueryItem(name: "maxDistance", value: "1000"),
            URLQueryItem(name: "differencePopularity", value: "5000"),
            URLQueryItem(name: "ageFrom", value: "1"),
            URLQueryItem(name: "ageTo", value: "100"),
        ]
        
        guard let url = urlComponents.url else {
            fatalError("Impossible de créer l'URL avec les paramètres")
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            fatalError("Impossible de récupérer le jeton d'autorisation")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            fatalError("Réponse non valide")
        }
        
        if (httpResponse.statusCode != 200) {
            DispatchQueue.main.async {
                self.idsSuggested = []
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
            return
        }
        
        let decoder = JSONDecoder()
        DispatchQueue.main.async {
            do {
                let suggestedUsers = try decoder.decode([SuggestedUser].self, from: data)
                self.idsSuggested = Array(suggestedUsers.prefix(1))
            } catch {
                self.idsSuggested = []
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
        }
    }
    
    func getUsersFromSuggestions() async throws {
        var baseUrl = "\(baseUrl)/users/manyUsers?ids="
        
        if self.idsSuggested.isEmpty {
            return
        }
        
        let idsParams = self.idsSuggested.map { "\($0.id)" }.joined(separator: ",")
        baseUrl.append(idsParams)
                        
        let urlComponents = URLComponents(string: baseUrl)!

        guard let url = urlComponents.url else {
            fatalError("Impossible de créer l'URL avec les paramètres")
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = KeychainManager().getTokenFromKeychain() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            fatalError("Impossible de récupérer le jeton d'autorisation")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
//        if let responseString = String(data: data, encoding: .utf8) {
//            print("Réponse de l'API : \(responseString)")
//        }
        
        guard let httpResponse = response as? HTTPURLResponse else {
            fatalError("Réponse non valide")
        }
        
        if (httpResponse.statusCode != 200) {
            DispatchQueue.main.async {
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
                return
            }
        }
        
        let decoder = JSONDecoder()
        
        DispatchQueue.main.async {
            do {
                self.userSuggestions = try decoder.decode([UserSuggestion].self, from: data)
            } catch {
                self.errorMessage = "Error, please try again later"
                self.showAlert = true
            }
        }
    }
    
//    func calculateAge(from dateString: String) -> String {
//        let dateFormatter = DateFormatter()
//        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
//        
//        guard let birthDate = dateFormatter.date(from: dateString) else {
//            return "0"
//        }
//        
//        let calendar = Calendar.current
//        let ageComponents = calendar.dateComponents([.year], from: birthDate, to: Date())
//        let age = ageComponents.year
//        let stringAge = String(age!)
//        
//        return stringAge
//    }
}
