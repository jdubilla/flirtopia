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
                ForEach(vm.userSuggestions, id: \.self) { user in
                    ZStack(alignment: .bottomLeading) {
                        if let uiImage = UIImage(data: user.mainPhoto) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .clipShape(RoundedRectangle(cornerRadius: 15))
                                .frame(width: 300, height: 350)
                                .aspectRatio(contentMode: .fit)
                        }
                        Text(user.firstName)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .offset(x: 20, y: -20)
                    }
                }
            }
        }.task {
            do {
                try await vm.getSuggestions()
                try await vm.getUsersFromSuggestions()
            } catch {
                print("Error")
            }
        }
    }
}

#Preview {
    SuggestionsView()
}
