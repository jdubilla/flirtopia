//
//  SuggestionsView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct SuggestionsView: View {
    
    @StateObject var vm = SuggestionsViewModel()
    
    var body: some View {
        ScrollView {
            LazyVStack {
                ForEach(vm.userSuggestions.indices, id: \.self) { index in
                    NavigationLink {
                        UserProfile(user: vm.userSuggestions[index])
                    } label: {
                        ZStack(alignment: .bottomLeading) {
                            Image(uiImage: vm.photosUser[index])
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 300, height: 300)
                                .clipShape(RoundedRectangle(cornerRadius: 15))
                                .shadow(color: .black, radius: 10)
                            Rectangle()
                                .frame(width: 300, height: 300)
                                .foregroundColor(Color.black.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 15))
                            Text("\(vm.userSuggestions[index].firstName), \(vm.userSuggestions[index].age)")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundStyle(.white)
                                .offset(x: 20, y: -20)
                        }
                    }
                }
            }
        }
        .alert(vm.errorMessage, isPresented: $vm.showAlert, actions: {})
        .task {
            do {
                try await vm.getSuggestions()
                try await vm.getUsersFromSuggestions()
            } catch {
                print("Error")
            }
        }
    }
}
