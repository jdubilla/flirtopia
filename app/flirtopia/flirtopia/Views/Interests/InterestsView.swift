//
//  InterestsView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct InterestsView: View {
    
    //    @StateObject var vm = InterestsViewModel()
    var testArray = ["OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test", "OK", "Test"]
    
    var body: some View {
        VStack {
            List {
                ForEach(0..<testArray.count) { index in
                    HStack {
                        Text(testArray[index])
                    }
                }
            }
        }
    }
}

#Preview {
    InterestsView()
}
